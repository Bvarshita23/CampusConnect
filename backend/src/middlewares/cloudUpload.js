import multer from "multer";

export const memoryUpload = multer({
  storage: multer.memoryStorage(), // store file in memory, not disk
});
