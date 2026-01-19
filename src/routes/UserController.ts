import type {Request, Response} from 'express';
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {prisma} from "../../lib/prisma.ts";
import {Router} from "express"

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
    const password = req.body.password
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    if(await prisma.user.findUnique({where: {email: req.body.email}})) {
        return res.status(400).json({message: 'Пользователь уже существует'})
    }

    const user = await prisma.user.create({
        data: {
            username: req.body.username,
            email: req.body.email,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            age: req.body.age,
            profilePicture: req.body.profilePicture,
            password: hash,
        }
    })

    const token = jwt.sign({id: user.id},
        'secretKey',
        {
            expiresIn: '30d',
        })
    console.log("User registered successfully")
    return res.status(200).json({
        user, token
    })
})
router.post('/login', async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique(
        {
            where: {email: req.body.email}
        })

    if (!user) {
        return res.status(401).json({
            message: `Неверный логин или пароль`,
        })
    }

    const isValidPass = await bcrypt.compare(req.body.password, user.password)

    if (!isValidPass) {
        return res.status(401).json({
            message: `Неверный логин или пароль`,
        })
    }

    const token = jwt.sign({id: user.id},
        'secret123',
        {
            expiresIn: '30d',
        })

    return res.status(200).json({
        token
    })
})
router.get('/getMe', async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique(
        {
            where: {email: req.body.email}
        })

    if (!user) {
        return res.status(401).json({message: 'Не удалось получить пользователя'})
    }
    const {password, ...userData} = user
    return res.status(200).json(userData)
})

// export const register = async (req: Request, res: Response) => {
//     const password = req.body.password
//     const salt = await bcrypt.genSalt(10)
//     const hash = await bcrypt.hash(password, salt)
//
//     if(await prisma.user.findUnique({where: {email: req.body.email}})) {
//         return res.status(400).json({message: 'Пользователь уже существует'})
//     }
//
//     const user = await prisma.user.create({
//         data: {
//             username: req.body.username,
//             email: req.body.email,
//             firstname: req.body.firstname,
//             lastname: req.body.lastname,
//             age: req.body.age,
//             profilePicture: req.body.profilePicture,
//             password: hash,
//         }
//     })
//
//     const token = jwt.sign({id: user.id},
//         'secretKey',
//         {
//             expiresIn: '30d',
//         })
//     console.log("User registered successfully")
//     return res.json({
//         user, token
//     })
// }
export const login = async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique(
        {
            where: {email: req.body.email}
        })

    if (!user) {
        return res.status(401).json({
            message: `Неверный логин или пароль`,
        })
    }

    const isValidPass = await bcrypt.compare(req.body.password, user.password)

    if (!isValidPass) {
        return res.status(401).json({
            message: `Неверный логин или пароль`,
        })
    }

    const token = jwt.sign({id: user.id},
        'secret123',
        {
            expiresIn: '30d',
        })

    return res.json({
        token
    })
}
export const getMe = async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique(
        {
            where: {email: req.body.email}
        })

    if (!user) {
        return res.status(401).json({message: 'Не удалось получить пользователя'})
    }
    const {password, ...userData} = user
    return res.json(userData)
}

// export const getMe = async (req, res) => {
//     try {
//         const user = await UserModel.findById(req.userId)
//
//         if (!user) {
//             return res.status(401).json({message: 'Не удалось получить пользователя'})
//         }
//         const {passwordHash, ...userData} = user._doc
//         res.json(userData)
//     } catch (err) {
//         console.log(err)
//         res.status(500).json({
//             message: 'Не удалось получить пользователя',
//         })
//     }
// }
export default router