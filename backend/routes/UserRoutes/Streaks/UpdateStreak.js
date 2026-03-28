import express from "express";
import { db } from "../../../db.js";
import { requireAuth } from "../../../middleware/auth.js";

const router = express.Router();

function getYesterday(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() - 1);
  return date.toLocaleDateString("en-CA");
}

router.post("/update", requireAuth, async (req, res) => {
  const uid = req.user.uid;
  const { type } = req.body;

  if (!type) {
    return res.status(400).json({ message: "type is required." });
  }

  try {
    const today = new Date().toLocaleDateString("en-CA");

    await db.query(
      `
      INSERT IGNORE INTO streak_logs (uid, type, activity_date)
      VALUES (?, ?, ?)
      `,
      [uid, type, today],
    );

    const [logs] = await db.query(
      `
      SELECT DATE_FORMAT(activity_date, '%Y-%m-%d') AS activity_date
      FROM streak_logs
      WHERE uid = ? AND type = ?
      ORDER BY activity_date DESC
      `,
      [uid, type],
    );

    let newCurrent = 0;
    let expectedDate = today;

    for (const log of logs) {
      if (log.activity_date === expectedDate) {
        newCurrent++;
        expectedDate = getYesterday(expectedDate);
      } else {
        break;
      }
    }

    const [rows] = await db.query(
      `
      SELECT current_streak, longest_streak
      FROM streaks
      WHERE uid = ? AND type = ?
      `,
      [uid, type],
    );

    if (!rows.length) {
      await db.query(
        `
        INSERT INTO streaks (uid, type, current_streak, longest_streak, last_activity_date)
        VALUES (?, ?, ?, ?, ?)
        `,
        [uid, type, newCurrent, newCurrent, today],
      );

      return res.status(200).json({
        message: "streak created.",
        current_streak: newCurrent,
        longest_streak: newCurrent,
      });
    }

    const streak = rows[0];
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
      message: "streak updated successfully.",
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
