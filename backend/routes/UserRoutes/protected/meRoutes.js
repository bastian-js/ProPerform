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

router.get("/me/trainer", requireAuth, async (req, res) => {
  const userId = req.user.uid;

  try {
    const [rows] = await db.query(
      `
        SELECT 
            t.tid,
            t.firstname,
            t.lastname,
            t.phone_number
        FROM trainer_athletes ta
        JOIN trainers t ON t.tid = ta.tid
        WHERE ta.uid = ?;
      `,
      [userId],
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "no trainer found for this user." });
    }

    const trainer = rows[0];

    return res.status(200).json(trainer);
  } catch (err) {
    console.error("fetch trainer error.", err);
    res.status(500).json({ message: "failed to fetch trainer." });
  }
});

const allowedFitnessLevels = ["beginner", "intermediate", "advanced"];

router.put("/me", requireAuth, async (req, res) => {
  const uid = req.user.uid;

  let { weight, height, fitness_level, training_frequency, primary_goal } =
    req.body;

  try {
    const updates = [];
    const values = [];

    if (fitness_level !== undefined) {
      if (!allowedFitnessLevels.includes(fitness_level)) {
        return res.status(400).json({
          message:
            "fitness_level has to be one of the available fitness levels",
          allowedFitnessLevels,
        });
      }

      updates.push("fitness_level = ?");
      values.push(fitness_level);
    }

    if (weight !== undefined) {
      if (typeof weight !== "number" || weight <= 0) {
        return res
          .status(400)
          .json({ message: "weight must be a positive number." });
      }

      updates.push("weight = ?");
      values.push(weight);
    }

    if (height !== undefined) {
      if (typeof height !== "number" || height <= 0) {
        return res
          .status(400)
          .json({ message: "height must be a positive number." });
      }

      updates.push("height = ?");
      values.push(height);
    }

    if (training_frequency !== undefined) {
      if (
        typeof training_frequency !== "number" ||
        training_frequency < 0 ||
        training_frequency > 14
      ) {
        return res.status(400).json({
          message: "training_frequency must be a number between 0 and 14.",
        });
      }

      updates.push("training_frequency = ?");
      values.push(training_frequency);
    }

    if (primary_goal !== undefined) {
      if (typeof primary_goal !== "string" || primary_goal.trim() === "") {
        return res
          .status(400)
          .json({ message: "primary_goal must be a non-empty string." });
      }

      updates.push("primary_goal = ?");
      values.push(primary_goal);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: "no valid fields to update." });
    }

    values.push(uid);

    const sql = `UPDATE users SET ${updates.join(", ")} WHERE uid = ?`;

    await db.execute(sql, values);

    return res.status(200).json({ message: "user updated successfully." });
  } catch (err) {
    console.error("update user error.", err);
    return res.status(500).json({ message: "failed to update user." });
  }
});

export default router;
