import {body} from 'express-validator'


export const registerValidation = [
    body("email", 'Неверный формат почты').isEmail(),
    body("password", 'Введите пароль (от 8 до 64 символов)').isLength({min: 8, max: 64})    ,
    body("username", 'Введите имя (от 3 до 32 символов)').isLength({min: 3, max: 32}),
    body("profilePicture", 'Неверный URL аватара').optional().isURL(),
]

export const loginValidation = [
    body("email", 'Неверный формат почты').isEmail(),
    body("password", 'Введите пароль (от 8 до 64 символов)').isLength({min: 8, max: 64}),
]

export const postCreateValidation = [
    body("title", 'Введите заголовок статьи (от 3 до 128 символов)').isLength({min: 3, max: 128}).isString(),
    body("description", 'Введите текст статьи (от 10 до 2000 символов)').isLength({min: 10, max: 2000}).isString(),
    body("imageUrl", 'Неверная ссылка на изображение').optional().isURL(),
]