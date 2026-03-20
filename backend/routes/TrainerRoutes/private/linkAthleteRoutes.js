import express from "express";
import { db } from "../../../db.js";
import { createRateLimiter } from "../../../middleware/rate.js";
import { requireAuth } from "../../../middleware/auth.js";
import { requireRole } from "../../../middleware/role.js";

const router = express.Router();

router.post(
  "/connect",
  requireAuth,
  requireRole("user"),
  createRateLimiter({ windowMs: 15 * 60 * 1000, max: 5 }),
  async (req, res) => {
    const { invite_code } = req.body;
    const uid = req.user.uid;

    if (!invite_code || invite_code.trim() === "") {
      return res.status(400).json({
        error: "invite code is required.",
      });
    }

    try {
      const [trainerRows] = await db.execute(
        "SELECT tid, firstname, lastname FROM trainers WHERE invite_code = ?",
        [invite_code.trim()],
      );

      if (trainerRows.length === 0) {
        return res.status(400).json({
          error: "invalid invite code.",
        });
      }

      const trainer = trainerRows[0];

      const [existing] = await db.execute(
        "SELECT * FROM trainer_athletes WHERE uid = ?",
        [uid],
      );

      if (existing.length > 0) {
        return res.status(409).json({
          error: "user already connected to a trainer.",
        });
      }

      await db.execute(
        "INSERT INTO trainer_athletes (tid, uid, assigned_date) VALUES (?, ?, CURDATE())",
        [trainer.tid, uid],
      );

      return res.status(200).json({
        message: "trainer connected successfully.",
        trainer: {
          tid: trainer.tid,
          firstname: trainer.firstname,
          lastname: trainer.lastname,
        },
      });
    } catch (error) {
      console.error("connect trainer error.", error);
      return res.status(500).json({
        error: "internal server error.",
      });
    }
  },
);

export default router;
