import express from "express";

import { upload } from "../../../helpers/multerMedia.js";

import { db } from "../../../db.js";

import { requireRole } from "../../../middleware/role.js";
import { createRateLimiter } from "../../../middleware/rate.js";

import { requireAuth } from "../../../middleware/auth.js";

const router = express.Router();

router.post(
  "/",
  requireAuth,
  requireRole("owner"),
  createRateLimiter({ windowMs: 15 * 60 * 1000, max: 30 }),
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "no file uploaded or unsupported file type.",
        });
      }

      const folder = req.file.mimetype.startsWith("image/")
        ? "images"
        : "videos";

      const url =
        "https://media.properform.app/" + folder + "/" + req.file.filename;

      const fileSize = req.file.size;

      const fileType = req.file.mimetype.startsWith("image/")
        ? "image"
        : "video";

      const fileName = req.file.filename;

      const [result] = await db.query(
        `
          INSERT INTO media (
            type,
            filename,
            url,
            size
          )
          VALUES (?, ?, ?, ?)
        `,
        [fileType, fileName, url, fileSize],
      );

      res.json({
        message: "file uploaded successfully.",
        filename: req.file.filename,
        url,
        mid: result.insertId,
      });
    } catch (err) {
      if (
        err.code === "ER_DUP_ENTRY" ||
        err.message === "File already exists" ||
        err.message === "Error: File already exists"
      ) {
        return res.status(409).json({
          message: "file already exists.",
        });
      }

      res.status(500).json({
        message: "error uploading file.",
        error: err.message,
      });
    }
  },
);

export default router;
