import express from "express";
import { requireAuth } from "../../../middleware/auth.js";
import { requireRole } from "../../../middleware/role.js";
import { db } from "../../../db.js";
import { sendPush } from "../../../helpers/push.js";

const router = express.Router();

const availableTargetTypes = ["all", "single"];

router.post(
  "/notifications/send",
  requireAuth,
  requireRole("owner"),
  async (req, res) => {
    const { title, body, targetType, targetId } = req.body;

    if (!title || !body) {
      return res
        .status(400)
        .json({ success: false, message: "title and body are required." });
    }

    let users = [];

    if (!availableTargetTypes.includes(targetType)) {
      return res.status(400).json({
        success: false,
        message: "only all and single are required targettypes.",
      });
    }

    if (targetType === "all") {
      [users] = await db.query("SELECT uid FROM users");
    }

    if (targetType === "single") {
      users = [{ uid: targetId }];
    }

    if (!users.length) {
      return res
        .status(400)
        .json({ success: false, message: "no users found." });
    }

    const [tokens] = await db.query(
      `
        SELECT expo_push_token, project_id FROM push_tokens WHERE uid IN (?)
        `,
      [users.map((u) => u.uid)],
    );

    await sendPush(tokens, title, body);

    await db.query(
      `
        INSERT INTO notifications
        (title, body, target_type, target_id, created_by)
        VALUES (?, ?, ?, ?, ?)
        `,
      [
        title,
        body,
        targetType,
        targetType === "single" ? targetId : null,
        req.user.uid,
      ],
    );

    res.status(200).json({ success: true });
  },
);

router.get(
  "/notifications",
  requireAuth,
  requireRole("owner"),
  async (req, res) => {
    try {
      const [rows] = await db.query(`
      SELECT 
        nid,
        title,
        body,
        target_type,
        target_id,
        created_by,
        created_at
      FROM notifications
      ORDER BY created_at DESC
    `);

      res.json(rows);
    } catch (err) {
      console.error("admin notifications error.", err);
      res.status(500).json({ error: "failed to fetch notifications." });
    }
  },
);

export default router;
