import express from "express";

import { requireAuth } from "../../middleware/auth.js";
import { db } from "../../db.js";

const router = express.Router();

router.get("/verify-token", requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT uid, firstname, email, created_at, last_login FROM users WHERE uid = ?",
      [req.user.uid],
    );

    res.status(200).json({ valid: true, uid: req.user.uid, user: rows[0] });
  } catch (error) {
    console.error("invalid token.:", error);
    res.status(500).json({ message: "invalid token.", error: error.message });
  }
});

export default router;
