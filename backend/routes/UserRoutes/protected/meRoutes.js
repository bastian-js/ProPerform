import express from "express";
import { db } from "../../../db.js";
import { requireAuth } from "../../../middleware/auth.js";
import { createRateLimiter } from "../../../middleware/rate.js";

const router = express.Router();

router.get(
  "/me",
  requireAuth,
  createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10 }),
  async (req, res) => {
    try {
      const userId = req.user.uid;

      console.log("jwt user.", req.user);

      const [rows] = await db.execute(
        `SELECT
     uid,
     firstname,
     birthdate,
     email,
     weight,
     height,
     gender,
     profile_image_url,
     onboarding_completed,
     fitness_level,
     training_frequency,
     primary_goal,
     role_id,
     last_login,
     created_at,
     updated_at,
     email_verified
   FROM users
   WHERE uid = ?
   LIMIT 1`,
        [userId],
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: "user not found." });
      }

      return res.status(200).json(rows[0]);
    } catch (err) {
      return res
        .status(500)
        .json({ message: "server error.", error: err.message });
    }
  },
);

export default router;
