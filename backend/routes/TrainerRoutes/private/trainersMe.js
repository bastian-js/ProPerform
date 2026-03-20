import express from "express";
import { db } from "../../../db.js";
import { requireAuth } from "../../../middleware/auth.js";
import { createRateLimiter } from "../../../middleware/rate.js";

const router = express.Router();

router.get(
  "/me",
  requireAuth,
  createRateLimiter({ windowMs: 15 * 60 * 1000, max: 20 }),
  async (req, res) => {
    try {
      const uid = req.user.uid;

      const [rows] = await db.execute(
        `
                SELECT t.tid, t.firstname, t.lastname, t.email
                FROM trainer_athletes ta
                JOIN trainers t ON ta.tid = t.tid
                WHERE ta.uid = ?
                LIMIT 1
            `,
        [uid],
      );

      if (rows.length === 0) {
        return res.status(200).json({ hasTrainer: false });
      }

      return res.status(200).json({ hasTrainer: true, trainer: rows[0] });
    } catch (err) {
      return res
        .status(500)
        .json({ message: "server error.", error: err.message });
    }
  },
);

export default router;
