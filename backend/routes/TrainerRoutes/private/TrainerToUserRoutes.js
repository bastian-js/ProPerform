import express from "express";
import { db } from "../../../db.js";
import { createRateLimiter } from "../../../middleware/rate.js";

const router = express.Router();

router.post(
  "/check-invite-code",
  createRateLimiter({ windowMs: 15 * 60 * 1000, max: 20 }),
  async (req, res) => {
    const { invite_code } = req.body;

    if (!invite_code?.trim()) {
      return res.status(400).json({
        success: false,
        message: "invite code is required.",
      });
    }

    try {
      const [rows] = await db.execute(
        "SELECT tid, firstname, lastname FROM trainers WHERE invite_code = ?",
        [invite_code.trim()],
      );

      if (rows.length === 0) {
        return res.status(200).json({
          success: false,
          message: "invalid invite code.",
        });
      }

      return res.status(200).json({
        success: true,
        trainer: {
          tid: rows[0].tid,
          firstname: rows[0].firstname,
          lastname: rows[0].lastname,
        },
      });
    } catch (error) {
      console.error("check invite code error.", error);
      return res.status(500).json({
        success: false,
        message: "server error.",
      });
    }
  },
);

export default router;
