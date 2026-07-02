import {body} from 'express-validator'

const email = body("email", 'Неверный формат почты').isEmail()
const password = body("password", 'Введите пароль (от 8 до 64 символов)').isLength({min: 8, max: 64})
const username =  body("username", 'Введите имя (от 3 до 32 символов)').isLength({min: 3, max: 32})
const profilePicture = body("profilePicture", 'Неверный URL аватара').optional().isURL()

const now = new Date();
const maxDate = new Date(); // минимум 13 лет
maxDate.setFullYear(now.getFullYear() - 13);

const minDate = new Date(); // максимум 140 лет
minDate.setFullYear(now.getFullYear() - 140);


export const registerValidation = [
    email,
    password,
    username    
]

export const profileChangeValidation = [
    username,
    profilePicture,
    body("age", 'Введите возраст (от 13 до 140 лет)').isLength({min: 13, max: 140}).isNumeric,
    body('birthday', 'введите вашу дату рождения').isDate().isBefore(maxDate.toISOString()).isAfter(minDate.toISOString())
]

export const loginValidation = [
    email,
    password
]

export const postCreateValidation = [
    body("title", 'Введите заголовок статьи (от 3 до 128 символов)').isLength({min: 3, max: 128}).isString(),
    body("description", 'Введите текст статьи (от 10 до 2000 символов)').isLength({min: 10, max: 2000}).isString(),
    body("imageUrl", 'Неверная ссылка на изображение').optional().isURL(),
]

export const communityCreateValidation = [
    body('name', 'Введите имя сообщества').isLength({min: 3, max: 128}).isString(),
    body('description', 'Введите описание сообщества').isLength({min: 10, max: 128}),
    body('imageUrl', 'Неверная ссылка на изображение').optional().isURL()
]

export const commentCreateValidation = [

]