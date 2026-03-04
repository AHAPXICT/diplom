import express, {type ErrorRequestHandler } from "express"
import {loginValidation, registerValidation} from "./src/validations.ts";
//import * as UserController from "./src/routes/UserController.ts";
import handleValidationErrors from "./src/utils/handleValidationErrors.ts";
import UserController from "./src/routes/UserController";
import PostController from "./src/routes/PostController";
//import checkAuth from "./src/utils/checkAuth.js";

const app = express()
const port = 3000

app.use(express.json());
app.use('/auth', UserController)
app.use('/posts', PostController)



// app.get("/auth/me", /*checkAuth(),*/ UserController.getMe)
// app.post("/auth/login",  UserController.login)
// app.post("/auth/register", , UserController.register)

// app.post('/upload', checkAuth(), upload.single('image'), (req, res) => {
//     res.json({url: `/uploads/${req.file.originalname}`})
// })

// app.post('/posts', checkAuth(), postCreateValidation, handleValidationErrors, PostController.create)
// app.get('/posts', PostController.getAll)
// app.get('/posts/:id', PostController.getOne)
// app.delete('/posts/:id', checkAuth(), PostController.remove)
// app.patch('/posts/:id', checkAuth(), postCreateValidation, handleValidationErrors, PostController.update)


const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({message: "Internal Server Error"});
};

app.use(errorHandler);

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})

