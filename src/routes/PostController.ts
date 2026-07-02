import express, {Request, Response, Router} from 'express'
import checkAuth from "../utils/checkAuth.ts";
import {postCreateValidation} from "../validations.ts";
import handleValidationErrors from "../utils/handleValidationErrors.ts";
import {prisma} from "../../lib/prisma.ts";
import {checkPostOwner} from "../utils/checkPostOwner.ts";
import {Post} from "../generated/prisma/client.ts";
import checkPostId from "../utils/checkPostId.ts";
import {upload} from "../../multer.ts";

const router = Router()


router.post('/', checkAuth(), upload.single('postImage'), async (req, res) => {
        try {
            const {
                title,
                description,
                communityId
            } = req.body;

            if (!communityId) {
                return res.status(400).json({
                    message: 'Выберите сообщество'
                });
            }

            if (!title?.trim()) {
                return res.status(400).json({
                    message: 'Введите заголовок'
                });
            }

            if (title.length > 300) {
                return res.status(400).json({
                    message: 'Заголовок слишком длинный'
                });
            }

            const community =
                await prisma.community.findUnique({
                    where: {
                        id: Number(communityId)
                    }
                });

            if (!community) {
                return res.status(404).json({
                    message: 'Сообщество не найдено'
                });
            }

            const imagePath = req.file
                ? '/' + req.file.path.replace(/\\/g, '/')
                : null;

            const createdPost =
                await prisma.post.create({
                    data: {
                        title: title.trim(),
                        description: description || null,
                        authorId: req.userId!,
                        parentPostId: req.body.parentPostId
                            ? Number(req.body.parentPostId)
                            : null,

                        image: imagePath,
                        communityId: Number(communityId)
                    },
                    include: {
                        parentPost: {
                            select: {
                                id: true,
                                title: true,
                                description: true,
                            }
                        }
                    }
                });

            res.status(201).json(createdPost);

        } catch (err) {

            console.error(err);

            res.status(500).json({
                message: 'Ошибка создания поста'
            });
        }
    }
);

router.post('/:id/comments', checkAuth(), async (req, res) => {
    try {
        const postId = Number(req.params.id);
        const { content, parentCommentId } = req.body;
        const userId = req.userId!;

        if (!content?.trim()) {
            return res.status(400).json({ message: 'Текст комментария обязателен' });
        }

        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post) {
            return res.status(404).json({ message: 'Пост не найден' });
        }

        if (parentCommentId) {
            const parentComment = await prisma.comment.findUnique({
                where: { id: Number(parentCommentId) },
            });
            if (!parentComment || parentComment.postId !== postId) {
                return res.status(404).json({ message: 'Родительский комментарий не найден' });
            }
        }

        const comment = await prisma.comment.create({
            data: {
                content: content.trim(),
                authorId: userId,
                postId,
                parentCommentId: parentCommentId ? Number(parentCommentId) : null,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        profilePicture: true,
                    },
                },
                replies: {
                    include: {
                        author: {
                            select: {
                                id: true,
                                username: true,
                                profilePicture: true,
                            },
                        },
                    },
                },
            },
        });

        res.status(201).json(comment);
    } catch (error) {
        console.error('Comment error:', error);
        res.status(500).json({ message: 'Ошибка создания комментария' });
    }
});

router.post('/:id/vote', checkAuth(), async (req, res) => {
    try {
        const postId = Number(req.params.id);
        const userId = req.userId!;
        const { value } = req.body; // 1 или -1

        if (value !== 1 && value !== -1) {
            return res.status(400).json({ message: 'Неверное значение голоса' });
        }

        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post) {
            return res.status(404).json({ message: 'Пост не найден' });
        }

        // Проверяем, голосовал ли уже пользователь
        const existingVote = await prisma.postVote.findUnique({
            where: {
                userId_postId: {
                    userId,
                    postId
                }
            }
        });

        if (existingVote) {
            if (existingVote.value === value) {
                // Убираем голос
                await prisma.postVote.delete({
                    where: { id: existingVote.id }
                });

                // Обновляем счётчик поста
                await prisma.post.update({
                    where: { id: postId },
                    data: { likesCount: { increment: -value } }
                });

                // Обновляем рейтинг автора
                await prisma.user.update({
                    where: { id: post.authorId },
                    data: { rating: { increment: -value } }
                });

                return res.json({
                    voted: false,
                    likesCount: post.likesCount - value
                });
            } else {
                // Меняем голос
                await prisma.postVote.update({
                    where: { id: existingVote.id },
                    data: { value }
                });

                // Было +1 стало -1 = разница -2
                // Было -1 стало +1 = разница +2
                const delta = value * 2;

                await prisma.post.update({
                    where: { id: postId },
                    data: { likesCount: { increment: delta } }
                });

                await prisma.user.update({
                    where: { id: post.authorId },
                    data: { rating: { increment: delta } }
                });

                return res.json({
                    voted: true,
                    likesCount: post.likesCount + delta
                });
            }
        }

        // Новый голос
        await prisma.postVote.create({
            data: {
                userId,
                postId,
                value
            }
        });

        const updatedPost = await prisma.post.update({
            where: { id: postId },
            data: { likesCount: { increment: value } }
        });

        // Обновляем рейтинг автора
        await prisma.user.update({
            where: { id: post.authorId },
            data: { rating: { increment: value } }
        });

        res.json({
            voted: true,
            likesCount: updatedPost.likesCount
        });
    } catch (error) {
        console.error('Vote error:', error);
        res.status(500).json({ message: 'Ошибка голосования' });
    }
});

router.get('/feed', checkAuth(), async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = 10;
        const userId = req.userId;

        const memberships = await prisma.communityMember.findMany({
            where: { userId },
            select: { communityId: true },
        });

        const communityIds = memberships.map(m => m.communityId);

        if (communityIds.length === 0) {
            return res.json({ posts: [], hasMore: false });
        }

        const [posts, total] = await Promise.all([
            prisma.post.findMany({
                where: {
                    communityId: { in: communityIds },
                    // убрал parentPostId: null — теперь и реплаи тоже
                },
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    parentPost: {
                        select: {
                            id: true,
                            title: true,
                            description: true,
                        }
                    },
                    author: {
                        select: {
                            id: true,
                            username: true,
                            profilePicture: true,
                        },
                    },
                    Community: {
                        select: {
                            id: true,
                            name: true,
                            imageUrl: true,
                        },
                    },
                    _count: {
                        select: { Comment: true },
                    },
                },
            }),
            prisma.post.count({
                where: {
                    communityId: { in: communityIds },
                },
            }),
        ]);

        res.json({
            posts: posts.map(post => ({
                id: post.id,
                title: post.title,
                description: post.description,
                image: post.image,
                viewsCount: post.viewsCount,
                likesCount: post.likesCount,
                createdAt: post.createdAt.toISOString(),
                commentsCount: post._count.Comment,
                author: post.author,
                community: post.Community,
                parentPost: post.parentPost, // ← добавил
            })),
            hasMore: page * limit < total,
        });
    } catch (error) {
        console.error('Feed error:', error);
        res.status(500).json({ message: 'Ошибка загрузки ленты' });
    }
});

router.get('/popular', async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = 10;

        const [posts, total] = await Promise.all([
            prisma.post.findMany({
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { likesCount: 'desc' },
                include: {
                    parentPost: {
                        select: {
                            id: true,
                            title: true,
                            description: true,
                        }
                    },
                    author: {
                        select: {
                            id: true,
                            username: true,
                            profilePicture: true,
                        },
                    },
                    Community: {
                        select: {
                            id: true,
                            name: true,
                            imageUrl: true,
                        },
                    },
                    _count: {
                        select: { Comment: true },
                    },
                },
            }),
            prisma.post.count(),
        ]);

        res.json({
            posts: posts.map(post => ({
                id: post.id,
                title: post.title,
                description: post.description,
                image: post.image,
                viewsCount: post.viewsCount,
                likesCount: post.likesCount,
                createdAt: post.createdAt.toISOString(),
                commentsCount: post._count.Comment,
                author: post.author,
                community: post.Community,
                parentPost: post.parentPost,
            })),
            hasMore: page * limit < total,
        });
    } catch (error) {
        console.error('Popular error:', error);
        res.status(500).json({ message: 'Ошибка загрузки популярных постов' });
    }
});

router.get('/graph/:id', async (req, res) => {
    try {
        const postId = Number(req.params.id);

        const post = await prisma.post.findUnique({
            where: { id: postId },
            select: {
                id: true,
                title: true,
                description: true,
                image: true,
                parentPost: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        image: true,
                        author: {
                            select: {
                                id: true,
                                username: true,
                                profilePicture: true,
                            }
                        }
                    }
                },
                author: {
                    select: {
                        id: true,
                        username: true,
                        profilePicture: true,
                    }
                },
                replies: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        image: true,
                        author: {
                            select: {
                                id: true,
                                username: true,
                                profilePicture: true,
                            }
                        },
                        Comment: {
                            where: { parentCommentId: null },
                            include: {
                                author: {
                                    select: {
                                        id: true,
                                        username: true,
                                        profilePicture: true,
                                    }
                                },
                                replies: {
                                    include: {
                                        author: {
                                            select: {
                                                id: true,
                                                username: true,
                                                profilePicture: true,
                                            }
                                        },
                                        replies: {
                                            include: {
                                                author: {
                                                    select: {
                                                        id: true,
                                                        username: true,
                                                        profilePicture: true,
                                                    }
                                                },
                                                replies: {
                                                    include: {
                                                        author: {
                                                            select: {
                                                                id: true,
                                                                username: true,
                                                                profilePicture: true,
                                                            }
                                                        },
                                                        replies: {
                                                            include: {
                                                                author: {
                                                                    select: {
                                                                        id: true,
                                                                        username: true,
                                                                        profilePicture: true,
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                Comment: {
                    where: { parentCommentId: null }, // ← ДОБАВИЛ
                    include: {
                        author: {
                            select: {
                                id: true,
                                username: true,
                                profilePicture: true,
                            }
                        },
                        replies: {
                            include: {
                                author: {
                                    select: {
                                        id: true,
                                        username: true,
                                        profilePicture: true,
                                    }
                                },
                                replies: {
                                    include: {
                                        author: {
                                            select: {
                                                id: true,
                                                username: true,
                                                profilePicture: true,
                                            }
                                        },
                                        replies: {
                                            include: {
                                                author: {
                                                    select: {
                                                        id: true,
                                                        username: true,
                                                        profilePicture: true,
                                                    }
                                                },
                                                replies: {
                                                    include: {
                                                        author: {
                                                            select: {
                                                                id: true,
                                                                username: true,
                                                                profilePicture: true,
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!post) {
            return res.status(404).json({ message: 'Пост не найден' });
        }

        res.json(post);
    } catch (error) {
        console.error('Graph data error:', error);
        res.status(500).json({ message: 'Ошибка загрузки данных графа' });
    }
});
router.get('/', async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = 10;

        const [posts, total] = await Promise.all([
            prisma.post.findMany({
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    parentPost: {
                        select: {
                            id: true,
                            title: true,
                            description: true,
                        }
                    },
                    author: {
                        select: {
                            id: true,
                            username: true,
                            profilePicture: true,
                        },
                    },
                    Community: {
                        select: {
                            id: true,
                            name: true,
                            imageUrl: true,
                        },
                    },
                    _count: {
                        select: { Comment: true },
                    },
                },
            }),
            prisma.post.count(),
        ]);

        res.json({
            posts: posts.map(post => ({
                id: post.id,
                title: post.title,
                description: post.description,
                image: post.image,
                viewsCount: post.viewsCount,
                likesCount: post.likesCount,
                createdAt: post.createdAt.toISOString(),
                commentsCount: post._count.Comment,
                author: post.author,
                community: post.Community,
                parentPost: post.parentPost, // ← добавил
            })),
            hasMore: page * limit < total,
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: 'Ошибка при загрузке постов' });
    }
});

router.get('/:id', async (req, res) => {
    const post = await prisma.post.findUnique({
        where: {
            id: Number(req.params.id)
        },
        include: {
            author: true,
            Community: true,
            Comment: {
                where: {
                    parentCommentId: null
                },
                include: {
                    author: {
                        select: {
                            id: true,
                            username: true,
                            profilePicture: true,
                        }
                    },
                    replies: {
                        include: {
                            author: {
                                select: {
                                    id: true,
                                    username: true,
                                    profilePicture: true,
                                }
                            },
                            replies: {
                                include: {
                                    author: {
                                        select: {
                                            id: true,
                                            username: true,
                                            profilePicture: true,
                                        }
                                    },
                                    replies: {
                                        include: {
                                            author: {
                                                select: {
                                                    id: true,
                                                    username: true,
                                                    profilePicture: true,
                                                }
                                            },
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
            },
            _count: {
                select: { Comment: true },
            },
        }
    });

    if (!post) {
        return res.status(404).json({ message: 'Пост не найден' });
    }

    res.json({
        ...post,
        community: post.Community,
        commentsCount: post._count.Comment,
    });
});


export default router