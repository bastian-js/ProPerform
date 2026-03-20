import express from "express";
import { db } from "../../../db.js";
import { requireAuth } from "../../../middleware/auth.js";
import { requireRole } from "../../../middleware/role.js";
import { createRateLimiter } from "../../../middleware/rate.js";

const router = express.Router();

router.get(
  "/:tid/athletes",
  requireAuth,
  requireRole("trainer"),
  createRateLimiter({ windowMs: 15 * 60 * 1000, max: 20 }),
  async (req, res) => {
    try {
      const { tid } = req.params;

      if (Number(tid) !== req.user.tid) {
        return res.status(403).json({ message: "forbidden." });
      }

      const [rows] = await db.execute(
        `
        SELECT u.uid, u.firstname, u.email, u.created_at
        FROM trainer_athletes ta
        JOIN users u ON ta.uid = u.uid
        WHERE ta.tid = ?
        ORDER BY u.created_at DESC
        `,
        [tid],
      );

      return res.status(200).json({ count: rows.length, athletes: rows });
    } catch (err) {
      return res
        .status(500)
        .json({ message: "server error.", error: err.message });
    }
  },
);

export default router;
