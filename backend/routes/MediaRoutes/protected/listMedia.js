import express from "express";

import { db } from "../../../db.js";

import { requireRole } from "../../../middleware/role.js";

import { requireAuth } from "../../../middleware/auth.js";

const router = express.Router();

router.get("/", requireAuth, requireRole("owner"), async (req, res) => {
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
    console.error("fetch media failed.", err);
    return res.status(500).json({ error: "internal server error." });
  }
});

export default router;
