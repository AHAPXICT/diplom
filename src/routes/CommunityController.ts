import checkPostId from "../utils/checkPostId.ts";
import {Post} from "../generated/prisma/client.ts";
import {prisma} from "../../lib/prisma.ts";
import {Router} from "express";
import checkAuth from "../utils/checkAuth.ts";
import {upload} from "../../multer.ts";

const router = Router()

router.get('/list', async (req, res) => {
    const communities = await prisma.community.findMany({
        select: {
            id: true,
            name: true
        },
        orderBy: {
            name: 'asc'
        }
    });

    res.json(communities);
});

router.get(
    '/',
    checkAuth(),
    async (req, res) => {

        const userId = req.userId!;

        const communities =
            await prisma.community.findMany({
                include: {
                    _count: {
                        select: {
                            members: true
                        }
                    }
                }
            });

        const memberships =
            await prisma.communityMember.findMany({
                where: {
                    userId: req.userId!
                },
                select: {
                    communityId: true
                }
            });

        const joinedIds = new Set(
            memberships.map(m => m.communityId)
        );

        res.json(
            communities.map(c => ({
                id: c.id,
                name: c.name,
                description: c.description,
                imageUrl: c.imageUrl,

                membersCount: c._count.members,

                isMember: joinedIds.has(c.id)
            }))
        );
    }
);

router.post(
    '/',
    checkAuth(),
    upload.single('communityImage'),
    async (req, res) => {
        try {
            const { name, description } = req.body;

            if (!name?.trim()) {
                return res.status(400).json({
                    message: 'Введите название сообщества'
                });
            }

            if (name.length < 3) {
                return res.status(400).json({
                    message: 'Название должно содержать минимум 3 символа'
                });
            }

            const exists = await prisma.community.findUnique({
                where: {
                    name: name.trim()
                }
            });

            if (exists) {
                return res.status(400).json({
                    message: 'Сообщество уже существует'
                });
            }

            const community = await prisma.community.create({
                data: {
                    name: name.trim(),
                    description: description || null,

                    imageUrl: req.file
                        ? '/' + req.file.path.replace(/\\/g, '/')
                        : null
                }
            });

            await prisma.communityMember.create({
                data: {
                    userId: Number(req.userId),
                    communityId: community.id
                }
            });

            res.status(201).json(community);

        } catch (err) {
            console.error(err);

            res.status(500).json({
                message: 'Ошибка создания сообщества'
            });
        }
    }
);

router.delete(
    '/:id/join',
    checkAuth(),
    async (req, res) => {
        await prisma.communityMember.deleteMany({
            where: {
                userId: req.userId,
                communityId: Number(req.params.id)
            }
        });

        res.json({
            success: true
        });
    }
);

router.post(
    '/:id/join',
    checkAuth(),
    async (req, res) => {

        const exists =
            await prisma.communityMember.findFirst({
                where: {
                    userId: req.userId,
                    communityId: Number(req.params.id)
                }
            });

        if (!exists) {
            await prisma.communityMember.create({
                data: {
                    userId: req.userId!,
                    communityId: Number(req.params.id)
                }
            });
        }

        res.json({
            success: true
        });
    }
);



export default router;