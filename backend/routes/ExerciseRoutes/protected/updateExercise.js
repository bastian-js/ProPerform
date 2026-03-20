import express from "express";
import { db } from "../../../db.js";

import { requireRole } from "../../../middleware/role.js";

import { requireAuth } from "../../../middleware/auth.js";

const router = express.Router();

router.put(
  "/exercises/:eid",
  requireAuth,
  requireRole("owner"),
  async (req, res) => {
    try {
      const eid = Number(req.params.eid);
      if (!Number.isInteger(eid)) {
        return res.status(400).json({ error: "invalid exercise id." });
      }

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

      if (
        !name ||
        !description ||
        !instructions ||
        !sid ||
        !dlid ||
        duration_minutes === undefined
      ) {
        return res.status(400).json({ error: "missing required fields." });
      }

      if (!Number.isInteger(duration_minutes) || duration_minutes < 0) {
        return res
          .status(400)
          .json({ error: "duration_minutes must be a positive integer." });
      }

      const [result] = await db.query(
        `
        UPDATE exercises
        SET
          name = ?,
          description = ?,
          instructions = ?,
          video_url = ?,
          thumbnail_url = ?,
          sid = ?,
          dlid = ?,
          duration_minutes = ?,
          equipment_needed = ?
        WHERE eid = ?
        `,
        [
          name,
          description,
          instructions,
          video_url ?? null,
          thumbnail_url ?? null,
          sid,
          dlid,
          duration_minutes,
          equipment_needed ?? null,
          eid,
        ],
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "exercise not found." });
      }

      return res.json({ status: "ok." });
    } catch (err) {
      console.error("update exercise failed.", err);
      return res.status(500).json({ error: "internal server error." });
    }
  },
);

export default router;
