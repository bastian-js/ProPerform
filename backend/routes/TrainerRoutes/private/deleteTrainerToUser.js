import express from "express";
import { db } from "../../../db.js";
import { requireAuth } from "../../../middleware/auth.js";
import { createRateLimiter } from "../../../middleware/rate.js";

const router = express.Router();

router.get(
  "/disconnect",
  requireAuth,
  createRateLimiter({ windowMs: 15 * 60 * 1000, max: 20 }),
  async (req, res) => {
    try {
      const uid = req.user.uid;

      const [result] = await db.execute(
        "DELETE FROM trainer_athletes WHERE uid = ?",
        [uid],
      );

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ message: "no trainer connection found." });
      }

      return res
        .status(200)
        .json({ message: "trainer disconnected successfully." });
    } catch (err) {
      return res
        .status(500)
        .json({ message: "server error.", error: err.message });
    }
  },
);

export default router;
