import express from "express";
import { db } from "../../../db.js";
import { generateTrainerCode } from "../../../helpers/TrainerFunctions.js";
import { requireRole } from "../../../middleware/role.js";
import { createRateLimiter } from "../../../middleware/rate.js";
import { requireAuth } from "../../../middleware/auth.js";

const router = express.Router();

router.patch(
  "/:tid/regenerate-code",
  requireAuth,
  requireRole("trainer"),
  createRateLimiter({ windowMs: 15 * 60 * 1000, max: 5 }),
  async (req, res) => {
    const { tid } = req.params;

    try {
      const newCode = generateTrainerCode();

      const [result] = await db.execute(
        "UPDATE trainers SET invite_code = ? WHERE tid = ?",
        [newCode, tid],
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "trainer not found." });
      }

      res.json({
        message: "invite code updated successfully.",
        newCode,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

export default router;
