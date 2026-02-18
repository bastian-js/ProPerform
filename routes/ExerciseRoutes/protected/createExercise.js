import express from "express";
import { db } from "../../../db.js";

import { requireRole } from "../../../middleware/role.js";
import { createRateLimiter } from "../../../middleware/rate.js";

import { requireAuth } from "../../../middleware/auth.js";

const router = express.Router();

router.post(
  "/exercises/create",
  requireAuth,
  requireRole("owner"),
  createRateLimiter({ windowMs: 15 * 60 * 1000, max: 30 }),
  async (req, res) => {
    try {
      const createdBy = req.user.id;

      const {
        name,
        description,
        instructions,
        video_url,
        thumbnail_url,
        sid,
        dlid,
        duration_minutes,
        equipment_needed,
      } = req.body;

      if (!name || !sid || !dlid)
        return res
          .status(400)
          .json({ error: "name, sid and dlid are required." });

      if (duration_minutes !== undefined && duration_minutes < 0) {
        return res
          .status(400)
          .json({ error: "duration_minutes must be positive" });
      }

      const [result] = await db.query(
        `
            INSERT INTO exercises (
                name,
                description,
                instructions,
                video_url,
                thumbnail_url,
                sid,
                dlid,
                duration_minutes,
                equipment_needed,
                created_by
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          name,
          description,
          instructions,
          video_url,
          thumbnail_url,
          sid,
          dlid,
          duration_minutes,
          equipment_needed,
          createdBy,
        ],
      );

      return res.status(201).json({ status: "ok", eid: result.insertId });
    } catch (err) {
      console.error("create exercise failed: ", err);
      return res.status(500).json({ error: "internal server error" });
    }
  },
);

export default router;
