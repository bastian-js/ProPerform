import express from "express";
import { db } from "../../../db.js";

import { requireRole } from "../../../middleware/role.js";

import { requireAuth } from "../../../middleware/auth.js";

import { createRateLimiter } from "../../../middleware/rate.js";

const router = express.Router();

const allowedFilters = ["gym", "basketball"];

router.get(
  "/",
  requireAuth,
  requireRole("user", "owner"),
  createRateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  async (req, res) => {
    try {
      const { scope } = req.query;
      let { filter } = req.query;

      let sportId = null;

      if (filter) {
        if (!allowedFilters.includes(filter)) {
          return res.status(400).json({ error: "invalid filter." });
        }

        if (filter === "gym") sportId = 1;
        if (filter === "basketball") sportId = 2;
      }

      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 10));
      const offset = (page - 1) * limit;

      let where = "";
      let params = [];

      if (sportId) {
        where = "WHERE e.sid = ?";
        params.push(sportId);
      }

      const [countResult] = await db.query(
        `SELECT COUNT(*) as total FROM exercises e ${where}`,
        params,
      );

      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      let query;

      // owner only
      if (scope === "admin") {
        if (req.user.role !== "owner") {
          return res.status(403).json({ error: "forbidden." });
        }

        query = `
          SELECT eid, name, created_by
          FROM exercises e
          ${where}
          ORDER BY created_at DESC
          LIMIT ? OFFSET ?
        `;

        params.push(limit, offset);
      }

      // user and owner
      else {
        query = `
          SELECT
            e.eid,
            e.name,
            e.description,
            e.instructions,
            e.sid,
            s.name AS sport,
            e.dlid,
            e.duration_minutes,
            e.equipment_needed,
            e.created_by,
            e.created_at,
            e.updated_at,
            v.url AS video_url,
            t.url AS thumbnail_url,
            JSON_ARRAYAGG(
              JSON_OBJECT(
                'mgid', mg.mgid,
                'name', mg.name,
                'is_primary', emg.is_primary
              )
            ) AS muscle_groups
          FROM exercises e
          LEFT JOIN sports s ON e.sid = s.sid
          LEFT JOIN media v ON e.video_mid = v.mid
          LEFT JOIN media t ON e.thumbnail_mid = t.mid
          LEFT JOIN exercise_muscle_groups emg ON e.eid = emg.eid
          LEFT JOIN muscle_groups mg ON emg.mgid = mg.mgid
          ${where}
          GROUP BY e.eid
          ORDER BY e.created_at DESC
          LIMIT ? OFFSET ?
        `;

        params.push(limit, offset);
      }

      const [rows] = await db.query(query, params);

      return res.json({
        count: rows.length,
        total,
        page,
        limit,
        totalPages,
        exercises: rows,
      });
    } catch (err) {
      console.error("fetch exercises failed.", err);
      return res.status(500).json({ error: "internal server error." });
    }
  },
);

export default router;
