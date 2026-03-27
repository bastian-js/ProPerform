import express from "express";
import { db } from "../../../db";

const router = express.Router();

router.post("/streak/update", async (req, res) => {
  const uid = req.user.uid;
  const { type } = req.body;

  if (!type) {
    return res.status(400).json({ message: "type is required." });
  }

  try {
    const today = new Date().toISOString().slice(0, 10);

    await db.query(
      `
            INSERT IGNORE INTO streak_logs (uid, type, activity_date)
            VALUES (?, ?, ?)
            `,
      [uid, type, today],
    );

    const [rows] = await db.query(
      `
            SELECT * FROM streaks WHERE uid = ? AND type = ?
            `,
      [uid, type],
    );

    if (!rows.length) {
      await db.query(
        `
            INSERT INTO streaks (uid, type, current_streak, longest_streak, last_activity_date)
            VALUES (?, ?, 1, 1, ?)
            `,
        [uid, type, today],
      );
    }

    const streak = rows[0];
    const lastDate = streak.last_activity_date;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    let newCurrent = 1;

    if (lastDate) {
      const last = lastDate.toISOString().slice(0, 10);
      const yest = yesterday.toISOString().slice(0, 10);

      if (last === today) {
        return res.status(200).json({
          message: "streak already updated today.",
          current_streak: streak.current_streak,
          longest_streak: streak.longest_streak,
        });
      }

      if (last === yest) {
        newCurrent = streak.current_streak + 1;
      }

      const newLongest = Math.max(newCurrent, streak.longest_streak);

      await db.query(
        `
        UPDATE streaks
        SET current_streak = ?, longest_streak = ?, last_activity_date = ?
        WHERE uid = ? AND type = ?
        `,
        [newCurrent, newLongest, today, uid, type],
      );

      return res.status(200).json({
        message: "streak updated succesfully.",
        current_streak: newCurrent,
        longest_streak: newLongest,
      });
    }
  } catch (err) {
    console.log("update streak error.", err);
    return res
      .status(500)
      .json({ message: "server error.", error: err.message });
  }
});
