import express from "express";
import { db } from "../../../../db.js";
import { requireAuth } from "../../../../middleware/auth.js";

const router = express.Router();

router.put("/:tpid", requireAuth, async (req, res) => {
  const { tpid } = req.params;
  const {
    name,
    description,
    sportId,
    difficultyLevelId,
    durationWeeks,
    sessionsPerWeek,
  } = req.body;
  const userId = req.user.uid;

  if (
    !name ||
    !description ||
    !sportId ||
    !difficultyLevelId ||
    !durationWeeks ||
    !sessionsPerWeek
  ) {
    return res.status(400).json({ message: "missing required fields." });
  }

  try {
    const [result] = await db.query(
      "UPDATE training_plans SET name = ?, description = ?, sport_id = ?, difficulty_level_id = ?, duration_weeks = ?, sessions_per_week = ? WHERE tpid = ? AND created_by_user = ?",
      [
        name,
        description,
        sportId,
        difficultyLevelId,
        durationWeeks,
        sessionsPerWeek,
        tpid,
        userId,
      ],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "training plan not found." });
    }

    res.json({
      message: "training plan updated successfully.",
      rowsAffected: result.affectedRows,
      id: tpid,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
