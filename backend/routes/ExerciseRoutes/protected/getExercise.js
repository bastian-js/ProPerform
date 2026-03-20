import express from "express";
import { db } from "../../../db.js";

import { requireRole } from "../../../middleware/role.js";

import { requireAuth } from "../../../middleware/auth.js";

const router = express.Router();

router.get(
  "/exercises/:eid",
  requireAuth,
  requireRole("owner"),
  async (req, res) => {
    try {
      const eid = Number(req.params.eid);
      if (!Number.isInteger(eid)) {
        return res.status(400).json({ error: "invalid exercise id." });
      }

      const [rows] = await db.query(
        `
        SELECT
          e.eid,
          e.name,
          e.description,
          e.instructions,
          v.url AS video_url,
          t.url AS thumbnail_url,
          e.sid,
          e.dlid,
          e.duration_minutes,
          e.equipment_needed,
          e.created_by,
          e.created_at,
          e.updated_at,
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'mgid', mg.mgid,
              'name', mg.name,
              'is_primary', emg.is_primary
            )
          ) AS muscle_groups
        FROM exercises e
        LEFT JOIN media v ON e.video_mid = v.mid
        LEFT JOIN media t ON e.thumbnail_mid = t.mid
        LEFT JOIN exercise_muscle_groups emg ON e.eid = emg.eid
        LEFT JOIN muscle_groups mg ON emg.mgid = mg.mgid
        WHERE e.eid = ?
        GROUP BY e.eid
        LIMIT 1
        `,
        [eid],
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: "exercise not found." });
      }

      return res.json(rows[0]);
    } catch (err) {
      console.error("get exercise failed.", err);
      return res.status(500).json({ error: "internal server error." });
    }
  },
);

export default router;
