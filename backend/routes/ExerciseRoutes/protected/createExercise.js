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
      const createdBy = req.user.uid;

      const {
        name,
        description,
        instructions,
        video_mid,
        thumbnail_mid,
        sid,
        dlid,
        duration_minutes,
        equipment_needed,
        muscle_groups,
      } = req.body;

      if (!name || !sid || !dlid)
        return res
          .status(400)
          .json({ error: "name, sid and dlid are required." });

      if (duration_minutes !== undefined && duration_minutes < 0) {
        return res
          .status(400)
          .json({ error: "duration_minutes must be positive." });
      }

      if (muscle_groups !== undefined) {
        if (!Array.isArray(muscle_groups)) {
          return res
            .status(400)
            .json({ error: "muscle_groups must be an array." });
        }

        for (const mg of muscle_groups) {
          if (!mg.mgid) {
            return res
              .status(400)
              .json({ error: "each muscle_group must have mgid." });
          }
          if (mg.is_primary !== undefined && ![0, 1].includes(mg.is_primary)) {
            return res
              .status(400)
              .json({ error: "is_primary must be 0 or 1." });
          }
        }
      }

      const [result] = await db.query(
        `
            INSERT INTO exercises (
                name,
                description,
                instructions,
                video_mid,
                thumbnail_mid,
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
          video_mid,
          thumbnail_mid || null,
          sid,
          dlid,
          duration_minutes || null,
          equipment_needed,
          createdBy,
        ],
      );

      const eid = result.insertId;

      if (muscle_groups && muscle_groups.length > 0) {
        const muscleGroupValues = muscle_groups.map((mg) => [
          eid,
          mg.mgid,
          mg.is_primary || 0,
        ]);

        await db.query(
          `
            INSERT INTO exercise_muscle_groups (eid, mgid, is_primary)
            VALUES ?
          `,
          [muscleGroupValues],
        );
      }

      return res.status(201).json({ status: "ok.", eid });
    } catch (err) {
      console.error("create exercise failed.", err);
      return res.status(500).json({ error: "internal server error." });
    }
  },
);

export default router;
