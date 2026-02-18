import express from "express";
import { db } from "../../../db.js";
import { requireAuth } from "../../../middleware/auth.js";
import { createRateLimiter } from "../../../middleware/rate.js";

const router = express.Router();

router.delete(
  "/deleteUser/:uid",
  requireAuth,
  createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10 }),
  async (req, res) => {
    const { uid } = req.params;

    console.log(`Lösche Benutzer mit UID: ${uid}`);

    try {
      const [result] = await db.execute("DELETE FROM users WHERE uid = ?", [
        uid,
      ]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Benutzer nicht gefunden" });
      }

      res.json({ message: "Benutzer erfolgreich gelöscht" });
    } catch (error) {
      console.error("Fehler beim Löschen des Benutzers:", error);
      res.status(500).json({ error: "Fehler beim Löschen des Benutzers" });
    }
  },
);

export default router;
