import express from "express";

import { upload } from "../../functions/multerMedia.js";

import { db } from "../../db.js";

import { requireRole } from "../../middleware/role.js";
import { createRateLimiter } from "../../middleware/rate.js";

import { requireAuth } from "../../middleware/auth.js";

const router = express.Router();

router.post(
  "/upload",
  upload.single("file"),
  requireAuth,
  requireRole("owner"),
  createRateLimiter({ windowMs: 15 * 60 * 1000, max: 30 }),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "No file uploaded or unsupported file type.",
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
        message: "File uploaded successfully",
        filename: req.file.filename,
        url,
        mid: result.mid,
      });
    } catch (err) {
      if (
        err.code === "ER_DUP_ENTRY" ||
        err.message === "File already exists" ||
        err.message === "Error: File already exists"
      ) {
        return res.status(409).json({
          message: "File already exists",
        });
      }

      res.status(500).json({
        message: "Error uploading file",
        error: err.message,
      });
    }
  },
);

router.get("/all", requireAuth, requireRole("owner"), async (req, res) => {
  try {
    const [rows] = await db.query(
      `
        SELECT mid, type, filename, url, size, created_at
        FROM media
        ORDER BY created_at DESC
      `,
    );

    return res.json({
      count: rows.length,
      media: rows,
    });
  } catch (err) {
    console.error("fetch media failed:", err);
    return res.status(500).json({ error: "internal server error" });
  }
});

router.delete("/:mid", requireAuth, requireRole("owner"), async (req, res) => {
  try {
    const { mid } = req.params;

    const [result] = await db.query(
      `
        DELETE FROM media
        WHERE mid = ?
      `,
      [mid],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "media not found" });
    }

    return res.json({
      status: "ok",
      message: `media with id ${mid} deleted`,
    });
  } catch (err) {
    console.error("delete media failed: ", err);
    return res.status(500).json({ error: "internal server error" });
  }
});

router.put("/:mid", requireAuth, requireRole("owner"), async (req, res) => {
  try {
    const { mid } = req.params;
    const { filename, url } = req.body;

    const [result] = await db.query(
      `
        UPDATE media
        SET filename = ?, url = ?
        WHERE mid = ?
      `,
      [filename, url, mid],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "media not found" });
    }

    return res.json({
      status: "ok",
      message: `media with id ${mid} updated`,
    });
  } catch (err) {
    console.error("update media failed: ", err);
    return res.status(500).json({ error: "internal server error" });
  }
});

export default router;
