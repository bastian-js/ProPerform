import express from "express";

import { db } from "../../../db.js";

import { requireRole } from "../../../middleware/role.js";

import { requireAuth } from "../../../middleware/auth.js";

const router = express.Router();

router.get(
  "/",
  requireAuth,
  requireRole("owner", "trainer"),
  async (req, res) => {
    const userRole = req.user.role;
    const userId = req.user.uid;

    try {
      let query = `
      SELECT mid, type, filename, url, size, created_at
      FROM media
    `;

      if (userRole === "owner") {
        // Owner
        query += `ORDER BY created_at DESC`;
      } else if (userRole === "trainer") {
        // Trainer
        query += `WHERE uid = ? ORDER BY created_at DESC`;
      }

      const [rows] = await db.query(
        query,
        userRole === "trainer" ? [userId] : [],
      );

      return res.json({
        count: rows.length,
        media: rows,
      });
    } catch (err) {
      console.error("fetch media failed.", err);
      return res.status(500).json({ error: "internal server error." });
    }
  },
);

export default router;
