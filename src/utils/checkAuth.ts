import jwt from 'jsonwebtoken'
import type {Request, Response, NextFunction} from "express";
import "dotenv/config";

export default () => (req: Request, res: Response, next: NextFunction) => {
    const token = (req.headers.authorization || '').replace('Bearer ', '')
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: number }
            req.userId = decoded.id
            next()
        }
        catch (err) {
            console.log(err)
            return res.status(403).json({"message": 'Нет доступа'})
        }
    }
    else {
        return res.status(403).json({"message": 'Нет доступа'})
    }
}