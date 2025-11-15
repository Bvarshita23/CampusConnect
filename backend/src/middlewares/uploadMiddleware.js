// backend/src/middlewares/uploadMiddleware.js
import multer from "multer";
import fs from "fs";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const rawRole = (req.body.role || "student").toLowerCase();
    // students → profiles/students, faculty → profiles/faculty, admins keep plural 's'
    const target =
      rawRole === "faculty"
        ? "faculty"
        : rawRole === "student"
        ? "students"
        : rawRole + "s";

    const uploadPath = path.join(
      process.cwd(),
      "backend",
      "src",
      "uploads",
      "profiles",
      target
    );
    if (!fs.existsSync(uploadPath))
      fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `photo-${unique}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.test(ext)) return cb(null, true);
    cb(new Error("Only .jpeg, .jpg, .png files are allowed"));
  },
});

export default upload;
