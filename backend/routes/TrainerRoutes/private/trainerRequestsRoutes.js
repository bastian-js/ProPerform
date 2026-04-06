import express from "express";
import { db } from "../../../db.js";
import { requireAuth } from "../../../middleware/auth.js";
import { requireRole } from "../../../middleware/role.js";

const router = express.Router();

// User: alle eigenen requests
router.get("/me", requireAuth, requireRole("user"), async (req, res) => {
  const uid = req.user.uid;

  try {
    const [rows] = await db.query(
      `SELECT tr.id, tr.status, tr.created_at,
              t.tid, t.firstname, t.lastname
       FROM trainer_requests tr
       JOIN trainers t ON tr.tid = t.tid
       WHERE tr.uid = ?
       ORDER BY tr.created_at DESC`,
      [uid],
    );

    return res.json({ requests: rows });
  } catch (err) {
    return res.status(500).json({ error: "failed" });
  }
});

// Trainer: nur pending requests
router.get(
  "/pending",
  requireAuth,
  requireRole("trainer"),
  async (req, res) => {
    const tid = req.user.tid;

    try {
      const [rows] = await db.query(
        `SELECT tr.id, tr.created_at,
              u.uid, u.firstname, u.email
       FROM trainer_requests tr
       JOIN users u ON tr.uid = u.uid
       WHERE tr.tid = ? AND tr.status = 'pending'
       ORDER BY tr.created_at ASC`,
        [tid],
      );

      return res.json({ requests: rows });
    } catch (err) {
      return res.status(500).json({ error: "failed" });
    }
  },
);

// Trainer: alle requests (pending, accepted, rejected)
router.get("/", requireAuth, requireRole("trainer"), async (req, res) => {
  const tid = req.user.tid;

  try {
    const [rows] = await db.query(
      `SELECT tr.id, tr.status, tr.created_at,
              u.uid, u.firstname
       FROM trainer_requests tr
       JOIN users u ON tr.uid = u.uid
       WHERE tr.tid = ?
       ORDER BY tr.created_at DESC`,
      [tid],
    );

    return res.json({ requests: rows });
  } catch (err) {
    return res.status(500).json({ error: "failed" });
  }
});

export default router;
