import express from "express";
import { db } from "../../db.js";

import { requireRole } from "../../middleware/role.js";
import { createRateLimiter } from "../../middleware/rate.js";

import { requireAuth } from "../../middleware/auth.js";

const router = express.Router();

router.get(
  "/all",
  requireAuth,
  requireRole("user"),
  createRateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  async (req, res) => {
    try {
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 10));

      const offset = (page - 1) * limit;

      const [countResult] = await db.query(
        `SELECT COUNT(*) as total FROM exercises`,
      );

      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      const [rows] = await db.query(
        `
        SELECT
  e.eid,
  e.name,
  e.description,
  e.instructions,
  e.sid,
  e.dlid,
  e.duration_minutes,
  e.equipment_needed,
  e.created_by,
  e.created_at,
  e.updated_at,

  v.url AS video_url,
  t.url AS thumbnail_url

FROM exercises e

        LEFT JOIN media v ON e.video_mid = v.mid
        LEFT JOIN media t ON e.thumbnail_mid = t.mid

        ORDER BY e.created_at DESC
        LIMIT ? OFFSET ?
      `,
        [limit, offset],
      );

      return res.json({
        count: rows.length,
        total,
        page,
        limit,
        totalPages,
        exercises: rows,
      });
    } catch (err) {
      console.error("fetch exercises failed:", err);
      return res.status(500).json({ error: "internal server error" });
    }
  },
);

export default router;
