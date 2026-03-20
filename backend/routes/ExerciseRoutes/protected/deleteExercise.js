import express from "express";
import { db } from "../../../db.js";

import { requireRole } from "../../../middleware/role.js";

import { requireAuth } from "../../../middleware/auth.js";

const router = express.Router();

router.delete(
  "/exercises/:eid",
  requireAuth,
  requireRole("owner"),
  async (req, res) => {
    try {
      const eid = Number(req.params.eid);
      if (!Number.isInteger(eid)) {
        return res.status(400).json({ error: "invalid exercise id." });
      }

      const [result] = await db.query(
        `
        DELETE FROM exercises
        WHERE eid = ?
      `,
        [eid],
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "exercise not found." });
      }

      return res.json({
        status: "ok.",
        message: `exercise with id ${eid} deleted.`,
      });
    } catch (err) {
      console.error("delete exercise failed.", err);
      return res.status(500).json({ error: "internal server error." });
    }
  },
);

export default router;
