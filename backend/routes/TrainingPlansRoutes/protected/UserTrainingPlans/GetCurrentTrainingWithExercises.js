import express from "express";
import { db } from "../../../../db.js";
import { requireAuth } from "../../../../middleware/auth.js";

const router = express.Router();

router.get("/training/today", requireAuth, async (req, res) => {
  const uid = req.user.uid;

  try {
    const [plans] = await db.query(
      `
      SELECT *
      FROM user_training_plans
      WHERE uid = ?
      AND status = 'active'
      AND is_selected = 1
      LIMIT 1
      `,
      [uid],
    );

    if (plans.length === 0) {
      return res.status(404).json({
        message: "no active training plan found",
      });
    }

    const plan = plans[0];

    const [dateCalc] = await db.query(
      `
      SELECT
        FLOOR(DATEDIFF(CURDATE(), ?) / 7) + 1 AS current_week,
        (DATEDIFF(CURDATE(), ?) % 7) + 1 AS current_day
      `,
      [plan.start_date, plan.start_date],
    );

    const { current_week, current_day } = dateCalc[0];

    const [exercises] = await db.query(
      `
      SELECT 
        tpe.*,
        e.name,
        e.description
      FROM training_plan_exercises tpe
      JOIN exercises e ON tpe.eid = e.eid
      WHERE tpe.tpid = ?
      AND tpe.week_number = ?
      AND tpe.day_number = ?
      ORDER BY tpe.exercise_order ASC
      `,
      [plan.tpid, current_week, current_day],
    );

    return res.status(200).json({
      plan: {
        tpid: plan.tpid,
        start_date: plan.start_date,
      },
      current_week,
      current_day,
      exercises,
    });
  } catch (error) {
    return res.status(500).json({
      message: "failed to fetch today's training",
      error: error.message,
    });
  }
});

router.get("/start/current", requireAuth, async (req, res) => {
  const userId = req.user.uid;

  try {
    const [selectedPlan] = await db.query(
      `
      SELECT utp.tpid
      FROM user_training_plans utp
      WHERE utp.uid = ? AND utp.is_selected = 1
      `,
      [userId],
    );

    if (selectedPlan.length === 0) {
      return res
        .status(404)
        .json({ message: "no selected training plan found" });
    }

    const tpid = selectedPlan[0].tpid;

    const [trainingPlan] = await db.query(
      "SELECT tpid, name, description, duration_weeks, sessions_per_week FROM training_plans WHERE tpid = ?",
      [tpid],
    );

    if (trainingPlan.length === 0) {
      return res.status(404).json({ message: "training plan not found" });
    }

    const [exercises] = await db.query(
      `
      SELECT 
        id,
        eid,
        week_number,
        day_number,
        exercise_order,
        sets,
        reps,
        duration_minutes,
        rest_seconds,
        notes
      FROM training_plan_exercises
      WHERE tpid = ?
      ORDER BY week_number ASC, day_number ASC, exercise_order ASC
      `,
      [tpid],
    );

    res.status(200).json({
      message: "current training loaded successfully",
      plan: trainingPlan[0],
      exercises: exercises,
    });
  } catch (error) {
    console.error("error loading current training:", error);
    res.status(500).json({
      message: "error loading current training",
      error: error.message,
    });
  }
});

export default router;
