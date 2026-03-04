import express, {Request, Response, Router} from 'express'
import checkAuth from "../utils/checkAuth.ts";
import {postCreateValidation} from "../validations.ts";
import handleValidationErrors from "../utils/handleValidationErrors.ts";
import {prisma} from "../../lib/prisma.ts";

const router = Router()


router.post('', checkAuth(), postCreateValidation, handleValidationErrors, async (req: Request, res: Response) => {
    const post = await prisma.post.create({
        data: {
            title: req.body.title,
            description: req.body.text,
            photo: req.body.imageUrl,
            authorId: req.body.authorId
        }
    });
    res.json(post)
})


router.get('', async (req: Request, res: Response) => {
    const posts = await prisma.post.findMany({
        where: {}
    })
    //const posts = await PostModel.find().populate({path: "user", select: ["fullName", "avatarUrl"]}).exec()
    res.json(posts)
})

// router.get('/:id', async (req, res) => {
//     const postId = getPostId(req)
//
//     const post = await prisma.post.update({
//         where: {
//             id: postId
//         },
//         data: {
//             viewsCount: {
//                 increment(1)
//             }
//         }
//     })
//     if (!post) {
//         return res.json({message: 'Статья не найдена'})
//     }
//     return res.json(post)
// })

router.delete('/:id', checkAuth(), async (req: Request, res: Response) => {
    const postId = getPostId(req)

    const post = await prisma.post.delete(
        {
            where: {
                id: postId
            }
        }
    )

    if (!post) {
        return res.json({message: 'Статья не найдена'})
    }
    res.json({success: true})
})

router.patch('/:id', checkAuth(), postCreateValidation, handleValidationErrors, async (req: Request, res: Response) => {
    const postId = getPostId(req)

    await prisma.post.update({
        where: {
            id: postId
        },
    data: {
        title: req.body?.title,
        description: req.body?.text,
        photo: req.body?.imageUrl,
    }})
    res.json({message: 'Success'})
})

const getPostId = (req: Request): number => Number(req.params.id)

export default router