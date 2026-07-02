import type {Request, Response} from 'express';
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {prisma} from "../../lib/prisma.ts";
import {Router} from "express"
import {loginValidation, registerValidation} from "../validations.ts";
import handleValidationErrors from "../utils/handleValidationErrors.ts";
import "dotenv/config";
import _ from "lodash";
import checkAuth from "../utils/checkAuth.ts";


const router = Router();

router.post('/register', registerValidation, handleValidationErrors, async (req: Request, res: Response) => {

    console.log(req.body)

    if(await prisma.user.findUnique({where: {email: req.body.email}})) {
        return res.status(400).json({message: 'Пользователь с такой почтой уже существует'})
    }

    if(await prisma.user.findUnique({where: {username: req.body.username}})) {
        return res.status(400).json(({message: 'Это имя уже занято'}))
    }

    const password = req.body.password
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    const userPrisma = await prisma.user.create({
        data: {
            username: req.body.username,
            email: req.body.email,
            password: hash
        }
    })

    const user = _.pick(userPrisma, ['id', 'email', 'username', 'birthday', 'profilePicture', 'createdAt', 'rating'])
    const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET as string,
        { expiresIn: '30d' }
    )
    return res.status(200).json({
        user, token
    })
})

router.post('/login', loginValidation, handleValidationErrors, async (req: Request, res: Response) => {
    console.log('login')
    const userPrisma = await prisma.user.findUnique(
        {
            where: {email: req.body.email}
        })

    if (!userPrisma) {
        return res.status(401).json({
            message: `Неверный логин или пароль`,
        })
    }

    const isValidPass = await bcrypt.compare(req.body.password, userPrisma.password)

    if (!isValidPass) {
        return res.status(401).json({
            message: `Неверный логин или пароль`,
        })
    }

    const user = _.pick(userPrisma, ['id', 'email', 'username', 'birthday', 'profilePicture', 'createdAt', 'rating'])
    const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET as string,
        { expiresIn: '30d' }
    )

    return res.status(200).json({
        token, user
    })
})

router.get('/me', checkAuth(), async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({
        where: {
            id: Number(req.userId)
        }
    });

    if (!user) {
        return res.status(404).json({
            message: 'Пользователь не найден'
        });
    }

    const userData = _.pick(user, ['id', 'email', 'username', 'birthday', 'profilePicture', 'createdAt', 'rating'])

    return res.json(userData);
});


export default router