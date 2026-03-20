import express from "express";
import { db } from "../../../db.js";
import { requireAuth } from "../../../middleware/auth.js";
import { createRateLimiter } from "../../../middleware/rate.js";

const router = express.Router();

const ROLES = {
  OWNER: 1,
  USER: 2,
  TRAINER: 3,
};

// separate route for statistics
router.get(
  "/stats",
  requireAuth,
  createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10 }),
  async (req, res) => {
    try {
      const [[userStats]] = await db.execute(
        `
      SELECT
        SUM(role_id = ?) AS owners,
        SUM(role_id = ?) AS users
      FROM users
    `,
        [ROLES.OWNER, ROLES.USER],
      );

      const [[trainerStats]] = await db.execute(
        "SELECT COUNT(*) AS trainers FROM trainers",
      );

      const total =
        (parseInt(userStats.owners) || 0) +
        (parseInt(userStats.users) || 0) +
        (parseInt(trainerStats.trainers) || 0);

      res.json({
        stats: {
          owners: parseInt(userStats.owners) || 0,
          users: parseInt(userStats.users) || 0,
          trainers: parseInt(trainerStats.trainers) || 0,
          total: total,
        },
      });
    } catch (err) {
      console.error("failed to fetch statistics.", err);
      res.status(500).json({
        error: "failed to fetch statistics.",
      });
    }
  },
);

export default router;
