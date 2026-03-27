import express from "express";
import { db } from "../../../db.js";
import { requireAuth } from "../../../middleware/auth.js";

const router = express.Router();

router.post("/update", requireAuth, async (req, res) => {
  const uid = req.user.uid;
  const { type } = req.body;

  if (!type) {
    return res.status(400).json({ message: "type is required." });
  }

  try {
    const today = new Date().toISOString().slice(0, 10);

    // check if a new log entry is created
    const [logResult] = await db.query(
      `
      insert ignore into streak_logs (uid, type, activity_date)
      values (?, ?, ?)
      `,
      [uid, type, today],
    );

    // if no row inserted, streak already updated today
    if (logResult.affectedRows === 0) {
      const [rows] = await db.query(
        `select current_streak, longest_streak from streaks where uid = ? and type = ?`,
        [uid, type],
      );

      return res.status(200).json({
        message: "streak already updated today.",
        current_streak: rows[0]?.current_streak ?? 1,
        longest_streak: rows[0]?.longest_streak ?? 1,
      });
    }

    const [rows] = await db.query(
      `
      select * from streaks where uid = ? and type = ?
      `,
      [uid, type],
    );

    // create initial streak if none exists
    if (!rows.length) {
      await db.query(
        `
        insert into streaks (uid, type, current_streak, longest_streak, last_activity_date)
        values (?, ?, 1, 1, ?)
        `,
        [uid, type, today],
      );

      return res.status(200).json({
        message: "streak created.",
        current_streak: 1,
        longest_streak: 1,
      });
    }

    const streak = rows[0];
    const lastDate = streak.last_activity_date;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    let newCurrent = 1;

    if (lastDate) {
      const last = new Date(lastDate).toISOString().slice(0, 10);
      const yest = yesterday.toISOString().slice(0, 10);

      // increase streak if last activity was yesterday
      if (last === yest) {
        newCurrent = streak.current_streak + 1;
      }
    }

    const newLongest = Math.max(newCurrent, streak.longest_streak);

    await db.query(
      `
      update streaks
      set current_streak = ?, longest_streak = ?, last_activity_date = ?
      where uid = ? and type = ?
      `,
      [newCurrent, newLongest, today, uid, type],
    );

    return res.status(200).json({
      message: "streak updated succesfully.",
      current_streak: newCurrent,
      longest_streak: newLongest,
    });
  } catch (err) {
    console.log("update streak error.", err);
    return res
      .status(500)
      .json({ message: "server error.", error: err.message });
  }
});

export default router;
