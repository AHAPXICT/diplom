import express, {type ErrorRequestHandler } from "express"
import cors from 'cors';
import {loginValidation, registerValidation} from "./src/validations.ts";
import multer from "multer"
//import * as UserController from "./src/routes/UserController.ts";
import handleValidationErrors from "./src/utils/handleValidationErrors.ts";
import UserController from "./src/routes/UserController";
import PostController from "./src/routes/PostController";
import path from "path"
import CommunityController from "./src/routes/CommunityController";
//import checkAuth from "./src/utils/checkAuth.js";

const app = express()
const port = 3000
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'))
app.use('/auth', UserController)
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

