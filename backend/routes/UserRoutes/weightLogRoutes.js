import express from "express";
import { db } from "../../db.js";

import { requireRole } from "../../middleware/role.js";
import { createRateLimiter } from "../../middleware/rate.js";

import { requireAuth } from "../../middleware/auth.js";

const router = express.Router();

router.post(
  "/weight",
  requireAuth,
  requireRole("user", "owner"),
  createRateLimiter({ windowMs: 15 * 60 * 1000, max: 20 }),
  async (req, res) => {
    try {
      const uid = req.user.uid;
      const { weight_kg, notes } = req.body;

      if (weight_kg === undefined)
        return res.status(400).json({ error: "weight_kg is required." });

      const weight = Number(weight_kg);
      if (Number.isNaN(weight) || weight <= 0)
        return res.status(400).json({ error: "invalid weight_kg." });

      await db.query(
        `
            INSERT INTO weight_logs (uid, weight_kg, measured_at, notes)
            VALUES (?, ?, NOW(), ?)
        `,
        [uid, weight, notes ?? null],
      );

      return res.status(201).json({ status: "ok.", weight_kg: weight });
    } catch (err) {
      console.error("create weight log failed.", err);
      return res.status(500).json({ error: "internal server error." });
    }
  },
);

router.get(
  "/weight",
  requireAuth,
  requireRole("user", "owner"),
  async (req, res) => {
    try {
      const uid = req.user.uid;

      const [rows] = await db.query(
        `
            SELECT 
            wlid, 
            weight_kg, 
            measured_at, 
            notes 
            FROM weight_logs
            WHERE uid = ?
            ORDER BY measured_at DESC
        `,
        [uid],
      );

      return res.status(200).json({
        count: rows.length,
        logs: rows,
      });
    } catch (err) {
      console.error("get weight logs failed.", err);
      return res.status(500).json({ error: "internal server error." });
    }
  },
);

export default router;
