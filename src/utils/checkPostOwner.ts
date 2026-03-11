import type {Request, Response, NextFunction} from "express";
import {prisma} from "../../lib/prisma.ts";

export const checkPostOwner = () => async (req: Request, res: Response, next: NextFunction) => {
    const postId = Number(req.params.id)
    const userId = req.userId

    const post = await prisma.post.findFirst({where: {id: postId}})

    if (!post) {
        return res.status(404).json({ message: 'Пост не найден' })
    }

    if (post.authorId !== userId) {
        return res.status(403).json({ message: 'Нет прав' })
    }

    next()
}