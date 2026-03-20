import express from "express";
import { requireAuth } from "../../../middleware/auth.js";
import { db } from "../../../db.js";

const router = express.Router();

router.get("/me", requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `
            SELECT * FROM notifications
            WHERE target_type='all'
                OR (target_type='single' AND target_id=?)
            ORDER BY created_at DESC
            `,
      [req.user.uid],
    );

    res.status(200).json({ success: true, notifications: rows });
  } catch (err) {
    console.error("notifications me error. " + err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
