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
        return res.status(400).json({ error: "invalid exercise id" });
      }

      const [rows] = await db.query(
        `
        SELECT
          eid,
          name,
          description,
          instructions,
          video_url,
          thumbnail_url,
          sid,
          dlid,
          duration_minutes,
          equipment_needed,
          created_by,
          created_at,
          updated_at
        FROM exercises
        WHERE eid = ?
        LIMIT 1
        `,
        [eid],
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: "exercise not found" });
      }

      return res.json(rows[0]);
    } catch (err) {
      console.error("get exercise failed:", err);
      return res.status(500).json({ error: "internal server error" });
    }
  },
);

export default router;
