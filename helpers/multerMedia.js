import multer from "multer";
import path, { basename } from "path";
import fs from "fs";

const sanitizeFilename = (name) => {
  return name.replace(/[^a-z0-9_-]/gi, "_");
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, "/var/www/html/media.properform.app/images");
    } else if (file.mimetype === "video/mp4") {
      cb(null, "/var/www/html/media.properform.app/videos");
    } else {
      cb(new Error("Unsupported file type"), false);
    }
  },

  filename: (req, file, cb) => {
    try {
      const ext = path.extname(file.originalname);

      const originalBase = path
        .parse(file.originalname)
        .name.replace(/[^a-z0-9_-]/gi, "_");

      const customName = req.query.filename
        ? sanitizeFilename(req.query.filename)
        : null;

      const finalName = (customName || originalBase) + ext;

      const folder = file.mimetype.startsWith("image/")
        ? "/var/www/html/media.properform.app/images/"
        : "/var/www/html/media.properform.app/videos/";

      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
      }

      const fullPath = folder + finalName;

      if (fs.existsSync(fullPath)) {
        return cb(new Error("File already exists"), false);
      }

      cb(null, finalName);
    } catch (err) {
      cb(err, false);
    }
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/png", "image/jpeg", "video/mp4"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type"), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 75 * 1024 * 1024,
  },
});
