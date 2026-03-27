import express from "express";
import fs from "fs/promises";
import path from "path";

import { db } from "../../../db.js";

import { requireRole } from "../../../middleware/role.js";

import { requireAuth } from "../../../middleware/auth.js";

const router = express.Router();

router.put(
  "/:mid",
  requireAuth,
  requireRole("owner", "trainer"),
  async (req, res) => {
    const userRole = req.user.role;
    const userId = req.user.role === "owner" ? req.user.uid : req.user.tid;

    try {
      const { mid } = req.params;
      const { filename } = req.body;

      if (!filename || !filename.trim()) {
        return res.status(400).json({ error: "filename is required." });
      }

      const cleanFilename = path
        .basename(filename.trim())
        .replace(/[^a-zA-Z0-9._-]/g, "_");

      const [existing] = await db.query(
        "SELECT mid FROM media WHERE filename = ? AND mid != ?",
        [cleanFilename, mid],
      );

      if (existing.length > 0) {
        return res.status(400).json({ error: "filename already exists." });
      }

      const ext = path.extname(cleanFilename).toLowerCase();

      const allowed = [".jpg", ".jpeg", ".png", ".webp", ".mp4", ".mov"];

      if (!allowed.includes(ext)) {
        return res.status(400).json({ error: "invalid file type." });
      }

      let query = `
        SELECT filename, type, created_by_user
        FROM media
        WHERE mid = ?      
      `;

      let params = [mid];

      if (userRole === "trainer") {
        query += " AND created_by_user = ?";
        params.push(userId);
      }

      const [rows] = await db.query(query, params);

      if (rows.length === 0) {
        return res
          .status(404)
          .json({ error: "media not found or access denied." });
      }

      const media = rows[0];

      const folder = media.type === "image" ? "images" : "videos";

      const basePath = "/var/www/html/media.properform.app";

      const oldPath = path.join(basePath, folder, media.filename);
      const newPath = path.join(basePath, folder, cleanFilename);

      try {
        await fs.rename(oldPath, newPath);
      } catch (err) {
        if (err.code !== "ENOENT") {
          throw err;
        }
      }

      const newUrl = `https://media.properform.app/${folder}/${cleanFilename}`;

      await db.query(
        `
        UPDATE media
        SET filename = ?, url = ?
        WHERE mid = ?
      `,
        [cleanFilename, newUrl, mid],
      );

      return res.json({
        status: "ok.",
        message: `media with id ${mid} updated.`,
      });
    } catch (err) {
      console.error("update media failed.", err);
      return res.status(500).json({ error: "internal server error." });
    }
  },
);

export default router;
