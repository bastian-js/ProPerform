import express from "express";

import { requireAuth } from "../../middleware/auth.js";
import { db } from "../../db.js";
import { requireRole } from "../../middleware/role.js";

const router = express.Router();

router.get("/verify-token", requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT uid, firstname, email, created_at, last_login FROM users WHERE uid = ?",
      [req.user.uid],
    );

    res.status(200).json({ valid: true, uid: req.user.uid, user: rows[0] });
  } catch (error) {
    console.error("invalid token.", error);
    res.status(500).json({ message: "invalid token.", error: error.message });
  }
});

router.post("/push-token", requireAuth, async (req, res) => {
  const { token, projectId } = req.body;

  if (!token) {
    return res.status(400).json({ message: "token is required." });
  }

  if (!projectId) {
    return res.status(400).json({ message: "projectId is required." });
  }

  try {
    await db.query(
      `
      INSERT INTO push_tokens (uid, expo_push_token, project_id) 
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE expo_push_token = ?, project_id = ?
      `,
      [req.user.uid, token, projectId, token, projectId],
    );

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
