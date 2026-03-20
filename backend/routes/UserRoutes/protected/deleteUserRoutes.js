import express from "express";
import { db } from "../../../db.js";
import { requireAuth } from "../../../middleware/auth.js";
import { createRateLimiter } from "../../../middleware/rate.js";
import { requireRole } from "../../../middleware/role.js";

const router = express.Router();

router.delete(
  "/:uid",
  requireAuth,
  requireRole("owner"),
  createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10 }),
  async (req, res) => {
    const { uid } = req.params;

    console.log(`deleting user with uid ${uid}.`);

    try {
      const [result] = await db.execute("DELETE FROM users WHERE uid = ?", [
        uid,
      ]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "user not found." });
      }

      res.json({ message: "user deleted successfully." });
    } catch (error) {
      console.error("failed to delete user.", error);
      res.status(500).json({ error: "failed to delete user." });
    }
  },
);

export default router;
