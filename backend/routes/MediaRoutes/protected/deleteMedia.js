import express from "express";
import fs from "fs/promises";
import path from "path";

import { db } from "../../../db.js";

import { requireRole } from "../../../middleware/role.js";

import { requireAuth } from "../../../middleware/auth.js";

const router = express.Router();

router.delete("/:mid", requireAuth, requireRole("owner"), async (req, res) => {
  try {
    const { mid } = req.params;

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

    const filePath = path.join(
      "/var/www/html/media.properform.app",
      folder,
      media.filename,
    );

    try {
      await fs.unlink(filePath);
    } catch (err) {
      if (err.code !== "ENOENT") {
        throw err;
      }
    }

    await db.query(
      `
        DELETE FROM media
        WHERE mid = ?
      `,
      [mid],
    );

    return res.json({
      status: "ok.",
      message: `media with id ${mid} deleted.`,
    });
  } catch (err) {
    console.error("delete media failed.", err);
    return res.status(500).json({ error: "internal server error." });
  }
});

export default router;
