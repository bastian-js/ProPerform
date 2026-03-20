import express from "express";

import { db } from "../../../db.js";

import { requireRole } from "../../../middleware/role.js";

import { requireAuth } from "../../../middleware/auth.js";

const router = express.Router();

router.get("/:mid", requireAuth, requireRole("owner"), async (req, res) => {
  const mid = Number(req.params.mid);

  if (!Number.isInteger(mid)) {
    return res.status(400).json({ error: "invalid media id." });
  }

  try {
    const [rows] = await db.query(
      `
        SELECT mid, type, filename
        FROM media
        WHERE mid = ?
        LIMIT 1
      `,
      [mid],
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "media not found." });
    }

    const media = rows[0];

    return res.status(200).json({ filename: media.filename, type: media.type });
  } catch (err) {
    console.error("fetch media failed.", err);
    return res.status(500).json({ error: "internal server error." });
  }
});

export default router;
