import express, {type ErrorRequestHandler } from "express"
import cors from 'cors';
import {loginValidation, registerValidation} from "./src/validations.ts";
import multer from "multer"
//import * as UserController from "./src/routes/AuthController.ts";
import handleValidationErrors from "./src/utils/handleValidationErrors.ts";
import UserController from "./src/routes/UserController";
import PostController from "./src/routes/PostController";
import path from "path"
import CommunityController from "./src/routes/CommunityController";
import AuthController from "./src/routes/AuthController";
//import checkAuth from "./src/utils/checkAuth.js";
import dotenv from "dotenv";

dotenv.config();

const app = express()
const port = Number(process.env.PORT) || 3000;

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

app.use(express.json());
app.use('/uploads', express.static('uploads'))

app.use('/user', UserController)
app.use('/auth', AuthController)
app.use('/posts', PostController)
app.use('/communities', CommunityController)

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({message: "Internal Server Error"});
};

app.use(errorHandler);

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})

