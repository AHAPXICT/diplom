import {Request, Response, Router} from "express";
import {prisma} from "../../lib/prisma.ts";
import _ from "lodash";
import checkAuth from "../utils/checkAuth.ts";
import {upload} from "../../multer.ts";

const router = Router();

router.get('/:username/posts', async (req, res) => {
    try {
        const { username } = req.params;
        const page = Number(req.query.page) || 1;
        const limit = 10;

        const user = await prisma.user.findUnique({
            where: { username },
            select: { id: true },
        });

        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        const [posts, total] = await Promise.all([
            prisma.post.findMany({
                where: {
                    authorId: user.id,
                },
                skip: (page - 1) * limit,
                take: limit,

                orderBy: {
                    createdAt: 'desc',
                },

                include: {
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
                        select: {
                            Comment: true,
                        },
                    },
                },
            }),
            prisma.post.count({
                where: {
                    authorId: user.id,
                },
            }),
        ]);

        const result = posts.map((post) => ({
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
        }));

        res.json({
            posts: result,
            hasMore: page * limit < total,
        });
    } catch (error) {
        console.error(`Error fetching posts for user ${req.params.username}:`, error);
        res.status(500).json({ message: 'Ошибка при загрузке постов пользователя' });
    }
});

router.get('/:username', async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique(
        {
            where: {username: String(req.params.username)},
            select: {
                id: true,
                username: true,
                email: true,
                birthday: true,
                profilePicture: true,
                about: true,
                createdAt: true,
                rating: true,

                _count: {
                    select: {
                        posts: true,
                        comments: true
                    }
                }
            }
        })

    if (!user) {
        return res.status(401).json({message: 'Не удалось получить пользователя'})
    }

    return res.status(200).json(user)
})

router.patch(
    '/me',
    checkAuth(),
    upload.single('avatar'),
    async (req: Request, res: Response) => {
        try {
            const updateData: any = {
                about: req.body.about || null,
                birthday: req.body.birthday
                    ? new Date(req.body.birthday)
                    : null
            };

            if (req.file) {
                updateData.profilePicture =
                    `/uploads/avatars/${req.file.filename}`;
            }

            const user = await prisma.user.update({
                where: {
                    id: Number(req.userId)
                },
                data: updateData,
                select: {
                    id: true,
                    username: true,
                    email: true,
                    birthday: true,
                    profilePicture: true,
                    about: true,
                    createdAt: true,
                    rating: true,

                    _count: {
                        select: {
                            posts: true,
                            comments: true
                        }
                    }
                }
            });
            res.json(user);

        } catch (err) {
            console.error(err);

            res.status(500).json({
                message: 'Не удалось обновить профиль'
            });
        }
    }
);

export default router;