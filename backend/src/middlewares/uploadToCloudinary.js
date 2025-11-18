import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

// Function-based folder selection
const folderSelector = (req, file) => {
  const type = req.uploadType;

  switch (type) {
    case "student":
      return "campusconnect/students";
    case "faculty":
      return "campusconnect/faculty";
    case "admin":
      return "campusconnect/admins";
    case "lostfound":
      return "campusconnect/lostfound";
    case "claim":
      return "campusconnect/claim-proofs";
    default:
      return "campusconnect/others";
  }
};

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: folderSelector(req, file),
    allowed_formats: ["jpg", "jpeg", "png"],
    public_id: Date.now() + "-" + file.originalname,
  }),
});

export const cloudUpload = multer({ storage });
