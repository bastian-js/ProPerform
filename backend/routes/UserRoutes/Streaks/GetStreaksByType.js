import express from "express";
import { db } from "../../../db";

const router = express.Router();

router.post("/streak/:type", async (req, res) => {
  const uid = req.user.uid;
  const { type } = req.body;

  if (!type) {
    return res.status(400).json({ message: "type is required." });
  }

  try {
    const [rows] = await db.query(
      `
        SELECT current_streak, longest_streak, last_activity_date
        FROM streaks
        WHERE uid = ? AND type = ?
        `,
      [uid, type],
    );

    if (!rows.length) {
      return res.status(200).json({
        current_streak: 0,
        longest_streak: 0,
        last_activity_date: null,
      });
    }

    res.status(200).json(rows[0]);
  } catch (err) {
    console.log("get streak by type error.", err);
    return res
      .status(500)
      .json({ message: "server error.", error: err.message });
  }
});
