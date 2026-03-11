import {Post} from "./generated/prisma/client.ts";  // Импортируйте нужные типы, если у вас есть

declare global {
    namespace Express {
        interface Request {
            post?: Post;
            userId?: number;
        }
    }
}
