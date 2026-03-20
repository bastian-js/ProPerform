import express from "express";
import fs from "fs/promises";
import path from "path";

import { db } from "../../../db.js";

import { requireRole } from "../../../middleware/role.js";

import { requireAuth } from "../../../middleware/auth.js";

const router = express.Router();

router.put("/:mid", requireAuth, requireRole("owner"), async (req, res) => {
  try {
    const { mid } = req.params;
    const { filename } = req.body;

    if (!filename || !filename.trim()) {
      return res.status(400).json({ error: "filename is required." });
    }

    const cleanFilename = path
      .basename(filename.trim())
      .replace(/[^a-zA-Z0-9._-]/g, "_");

    const [rows] = await db.query(
      `
        SELECT filename, type
        FROM media
        WHERE mid = ?
      `,
      [mid],
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "media not found." });
    }

    const media = rows[0];

    const folder = media.type === "image" ? "images" : "videos";

    const oldPath = path.join(
      "/var/www/html/media.properform.app",
      folder,
      media.filename,
    );

    const newPath = path.join(
      "/var/www/html/media.properform.app",
      folder,
      cleanFilename,
    );

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
});

export default router;
