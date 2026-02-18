import express from "express";
import { db } from "../../../db.js";

import { requireRole } from "../../../middleware/role.js";

import { requireAuth } from "../../../middleware/auth.js";

const router = express.Router();

router.get(
  "/exercises",
  requireAuth,
  requireRole("owner"),
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
            eid,
            name,
            created_by
          FROM exercises
          ORDER BY created_at DESC
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
