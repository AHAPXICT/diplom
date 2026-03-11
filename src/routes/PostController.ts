import express, {Request, Response, Router} from 'express'
import checkAuth from "../utils/checkAuth.ts";
import {postCreateValidation} from "../validations.ts";
import handleValidationErrors from "../utils/handleValidationErrors.ts";
import {prisma} from "../../lib/prisma.ts";
import {checkPostOwner} from "../utils/checkPostOwner.ts";
import {Post} from "../generated/prisma/client.ts";
import checkPostId from "../utils/checkPostId.ts";

const router = Router()


router.post('/', checkAuth(), postCreateValidation, handleValidationErrors, async (req: Request, res: Response) => {
    const post = await prisma.post.create({
        data: {
            title: req.body.title,
            description: req.body.description,
            photo: req.body.photo,
            authorId: Number(req.userId)
        }
    });
    const {authorId, ...postData} = post
    res.json(postData)
})


// router.get('/:username', async (req: Request, res: Response) => {
//     const posts = await prisma.post.findMany({
//         where: {authorId: req.userId}
//     })
//
//     const newPosts = posts.map(({authorId, ...rest}) => rest)
//     res.json(newPosts)
// })

router.get('/:id', checkPostId(), async (req, res) => {
    const post = req.post as Post

    const updatedPost = await prisma.post.update({
        where: { id: post.id },
        data: {
            viewsCount: { increment: 1 }
        },
        include: {
            author: {
                select: {
                    username: true
                }
            }
        }
    })

    const { authorId, ...postData } = updatedPost

    return res.json(postData)
})

router.delete('/:id', checkAuth(), checkPostOwner(), checkPostId(), async (req: Request, res: Response) => {
    const post = req.post as Post

    const deletedPost = await prisma.post.delete(
        {
            where: {
                id: post.id
            }
        }
    )

    res.json({success: true})
})

router.patch('/:id', checkAuth(), checkPostOwner(), checkPostId(), postCreateValidation, handleValidationErrors, async (req: Request, res: Response) => {
    const post = req.post as Post

    await prisma.post.update({
        where: {
            id: post.id
        },
    data: {
        title: req.body?.title,
        description: req.body?.description,
        photo: req.body?.photo,
    }})
    res.json({message: 'Success'})
})

export default router