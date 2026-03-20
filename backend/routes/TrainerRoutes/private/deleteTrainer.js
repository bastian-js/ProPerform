import express from "express";
import { db } from "../../../db.js";
import { requireRole } from "../../../middleware/role.js";
import { createRateLimiter } from "../../../middleware/rate.js";
import { requireAuth } from "../../../middleware/auth.js";

const router = express.Router();

router.delete(
  "/:tid",
  requireAuth,
  requireRole("owner"),
  createRateLimiter({ windowMs: 15 * 60 * 1000, max: 5 }),
  async (req, res) => {
    const { tid } = req.params;

    try {
      const [result] = await db.execute("DELETE FROM trainers WHERE tid = ?", [
        tid,
      ]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "trainer not found." });
      }

      res.status(200).json({ message: `trainer with id ${tid} deleted.` });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

export default router;
