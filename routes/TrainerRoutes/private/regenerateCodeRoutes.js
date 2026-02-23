import express from "express";
import { db } from "../../../db.js";
import { generateTrainerCode } from "../../../helpers/TrainerFunctions.js";
import { requireRole } from "../../../middleware/role.js";
import { createRateLimiter } from "../../../middleware/rate.js";

const router = express.Router();

router.patch(
  "/:id/regenerateCode",
  requireRole("trainer"),
  createRateLimiter({ windowMs: 15 * 60 * 1000, max: 5 }),
  async (req, res) => {
    const { id } = req.params;

    try {
      const newCode = generateTrainerCode();

      const [result] = await db.execute(
        "UPDATE trainers SET invite_code = ? WHERE tid = ?",
        [newCode, id],
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Trainer nicht gefunden." });
      }

      res.json({
        message: "Einladungscode erfolgreich aktualisiert.",
        newCode,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

export default router;
