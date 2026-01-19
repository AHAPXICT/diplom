// import type { Request, Response } from 'express'
//
// export const getPost = async (req: Request, res: Response) => {
//
// }
// export const getPosts = async (req: Request, res: Response) => {
//
// }
// export const createPost = async (req: Request, res: Response) => {
//
// }
// export const updatePost = async (req: Request, res: Response) => {
//
// }
//
// export const create = async (req, res) => {
//     try {
//         const doc = new PostModel({
//             title: req.body.title,
//             text: req.body.text,
//             imageUrl: req.body.imageUrl,
//             tags: req.body.tags,
//             user: req.userId
//         });
//         const post = await doc.save()
//         res.json(post)
//     } catch (err) {
//         console.log(err);
//         return res.status(500).json({message: "Не удалось создать статю"})
//     }
// }
//
// export const getAll = async (req, res) => {
//     try {
//         const posts = await PostModel.find().populate({path: "user", select: ["fullName", "avatarUrl"]}).exec()
//         res.json(posts)
//     } catch (err) {
//         console.log(err);
//         return res.status(500).json({message: 'Не удалось получить статьи'})
//     }
// }
//
// export const getOne = async (req, res) => {
//     try {
//         const postId = getPostId(req)
//         let doc = await PostModel.findOneAndUpdate(
//             {_id: postId},
//             {$inc: {viewsCount: 1}},
//             {returnDocument: 'after'}
//         );
//         if (!doc) {
//             return res.json({message: 'Статья не найдена'})
//         }
//         res.json(doc)
//
//     } catch (err) {
//         console.log(err);
//         return res.status(500).json({message: 'Не удалось получить статью'})
//     }
// }
//
// export const remove = async (req, res) => {
//     try {
//         const postId = getPostId(req)
//
//         const doc = await PostModel.findOneAndDelete({_id: postId})
//         if (!doc) {
//             return res.json({message: 'Статья не найдена'})
//         }
//         res.json({success: true})
//     } catch
//         (err) {
//         console.log(err);
//         return res.status(500).json({message: 'Не удалось удалить статью'})
//     }
//
// }
// export const update = async (req, res) => {
//     try {
//         const  postId = getPostId(req)
//
//         await PostModel.updateOne({
//             _id: postId
//         }, {
//             title: req.body?.title,
//             text: req.body?.text,
//             imageUrl: req.body?.imageUrl,
//             tags: req.body?.tags,
//             user: req?.userId
//         })
//         res.json({message: 'Success'})
//     }
//     catch
//         (err) {
//         console.log(err);
//         return res.status(500).json({message: 'Не удалось обновить статью'})
//     }
// }
//
// const getPostId = (req) => req.params.id
