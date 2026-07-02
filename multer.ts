import multer from "multer";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === "avatar") {
            cb(null, "uploads/avatars");
            return;
        }

        if (file.fieldname === "communityImage") {
            cb(null, "uploads/communities");
            return;
        }

        if (file.fieldname === "postImage") {
            cb(null, "uploads/posts");
            return;
        }

        cb(new Error("Unknown upload type"), "");
    },

    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});
export const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024
    }
})