import express from "express";
import { db } from "../../../db.js";
import { createRateLimiter } from "../../../middleware/rate.js";

const router = express.Router();

router.post(
  "/link-athlete",
  createRateLimiter({ windowMs: 15 * 60 * 1000, max: 5 }),
  async (req, res) => {
    const { invite_code, athlete_id } = req.body;

    if (!invite_code || invite_code.trim() === "") {
      return res.status(400).json({ error: "Einladungscode fehlt." });
    }

    if (!athlete_id) {
      return res.status(400).json({ error: "Athleten-ID fehlt." });
    }

    try {
      // Trainer anhand Code finden
      const [trainerRows] = await db.execute(
        "SELECT tid FROM trainers WHERE invite_code = ?",
        [invite_code.trim()],
      );

      if (trainerRows.length === 0) {
        return res.status(404).json({ error: "Ungültiger Einladungscode." });
      }

      const trainerId = trainerRows[0].tid;

      // Prüfen, ob Athlet schon einen Trainer hat
      const [existing] = await db.execute(
        "SELECT * FROM trainer_athletes WHERE athlete_uid = ?",
        [athlete_id],
      );

      if (existing.length > 0) {
        return res
          .status(409)
          .json({ error: "Athlet ist bereits einem Trainer zugewiesen." });
      }

      await db.execute(
        "INSERT INTO trainer_athletes (tid, athlete_uid, assigned_date) VALUES (?, ?, CURDATE())",
        [trainerId, athlete_id],
      );

      res.status(200).json({
        message: "Athlet erfolgreich mit Trainer verknüpft.",
        trainer_id: trainerId,
      });
    } catch (error) {
      console.error("Fehler bei /link-athlete:", error);
      res.status(500).json({ error: "Interner Serverfehler." });
    }
  },
);

export default router;
