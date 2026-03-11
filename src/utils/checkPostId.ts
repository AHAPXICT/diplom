import type {Request, Response, NextFunction} from "express";
import {prisma} from "../../lib/prisma.ts";

export default () => async (req: Request, res: Response, next: NextFunction) => {
        try {
            const postId = req.params.id
            if (!postId) {
                return res.status(404).json({"message": "Пост не найден"});
            }
            const post = await prisma.post.findFirst({
                where: { id: Number(postId) },
            });

            if (!post) {
                return res.status(404).json({ "message": 'Пост не найден' });
            }

            req.post = post
            next()
        }
        catch (err) {
            console.log(err)
            return res.status(500).json({"message": 'Ошибка при получении поста'})
        }
}