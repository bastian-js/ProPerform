import express from "express";
import fs from "fs/promises";
import path from "path";

import { db } from "../../../db.js";

import { requireRole } from "../../../middleware/role.js";

import { requireAuth } from "../../../middleware/auth.js";

const router = express.Router();

router.delete(
  "/:mid",
  requireAuth,
  requireRole("owner", "trainer"),
  async (req, res) => {
    const userRole = req.user.role;
    const userId = req.user.role === "owner" ? req.user.uid : req.user.tid;

    try {
      const { mid } = req.params;

      let query = `
      SELECT filename, type
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

      if (userRole === "trainer") {
        await db.query(
          `
          DELETE FROM media
          WHERE mid = ? AND created_by_user = ?
        `,
          [mid, userId],
        );
      } else {
        await db.query(
          `
          DELETE FROM media
          WHERE mid = ?
        `,
          [mid],
        );
      }

      return res.json({
        status: "ok.",
        message: `media with id ${mid} deleted.`,
      });
    } catch (err) {
      console.error("delete media failed.", err);
      return res.status(500).json({ error: "internal server error." });
    }
  },
);

export default router;
