import multer from "multer";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (req.path.includes("avatar")) {
            cb(null, "uploads/avatars");
        } else if (req.path.includes("community")) {
            cb(null, "uploads/communities");
        } else if (req.path.includes("post")) {
            cb(null, "uploads/posts");
        }
    },

    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});
export const upload = multer({
    storage
})