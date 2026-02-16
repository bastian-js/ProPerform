import express from "express";
import { db } from "../../db.js";

import { requireRole } from "../../middleware/role.js";
import { createRateLimiter } from "../../middleware/rate.js";

import { requireAuth } from "../../middleware/auth.js";

const router = express.Router();

router.post(
  "/exercises/create",
  requireAuth,
  requireRole("owner"),
  createRateLimiter({ windowMs: 15 * 60 * 1000, max: 30 }),
  async (req, res) => {
    try {
      const createdBy = req.user.id;

      const {
        name,
        description,
        instructions,
        video_url,
        thumbnail_url,
        sid,
        dlid,
        duration_minutes,
        equipment_needed,
      } = req.body;

      if (!name || !sid || !dlid)
        return res
          .status(400)
          .json({ error: "name, sid and dlid are required." });

      if (duration_minutes !== undefined && duration_minutes < 0) {
        return res
          .status(400)
          .json({ error: "duration_minutes must be positive" });
      }

      const [result] = await db.query(
        `
            INSERT INTO exercises (
                name,
                description,
                instructions,
                video_url,
                thumbnail_url,
                sid,
                dlid,
                duration_minutes,
                equipment_needed,
                created_by
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          name,
          description,
          instructions,
          video_url,
          thumbnail_url,
          sid,
          dlid,
          duration_minutes,
          equipment_needed,
          createdBy,
        ],
      );

      return res.status(201).json({ status: "ok", eid: result.insertId });
    } catch (err) {
      console.error("create exercise failed: ", err);
      return res.status(500).json({ error: "internal server error" });
    }
  },
);

router.get(
  "/exercises",
  requireAuth,
  requireRole("owner"),
  async (req, res) => {
    try {
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 10));

      const offset = (page - 1) * limit;

      const [countResult] = await db.query(
        `SELECT COUNT(*) as total FROM exercises`,
      );
      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      const [rows] = await db.query(
        `
          SELECT
            eid,
            name,
            created_by
          FROM exercises
          ORDER BY created_at DESC
          LIMIT ? OFFSET ?
        `,
        [limit, offset],
      );

      return res.json({
        count: rows.length,
        total,
        page,
        limit,
        totalPages,
        exercises: rows,
      });
    } catch (err) {
      console.error("fetch exercises failed:", err);
      return res.status(500).json({ error: "internal server error" });
    }
  },
);

router.delete(
  "/exercises/:eid",
  requireAuth,
  requireRole("owner"),
  async (req, res) => {
    try {
      const { eid } = req.params;

      const [result] = await db.query(
        `
        DELETE FROM exercises
        WHERE eid = ?
      `,
        [eid],
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "exercise not found" });
      }

      return res.json({
        status: "ok",
        message: `exercise with id ${eid} deleted`,
      });
    } catch (err) {
      console.error("delete exercise failed: ", err);
      return res.status(500).json({ error: "internal server error" });
    }
  },
);

router.put(
  "/exercises/:eid",
  requireAuth,
  requireRole("owner"),
  async (req, res) => {
    try {
      const eid = Number(req.params.eid);
      if (!Number.isInteger(eid)) {
        return res.status(400).json({ error: "invalid exercise id" });
      }

      const {
        name,
        description,
        instructions,
        video_url,
        thumbnail_url,
        sid,
        dlid,
        duration_minutes,
        equipment_needed,
      } = req.body;

      if (
        !name ||
        !description ||
        !instructions ||
        !sid ||
        !dlid ||
        duration_minutes === undefined
      ) {
        return res.status(400).json({ error: "missing required fields" });
      }

      if (!Number.isInteger(duration_minutes) || duration_minutes < 0) {
        return res
          .status(400)
          .json({ error: "duration_minutes must be a positive integer" });
      }

      const [result] = await db.query(
        `
        UPDATE exercises
        SET
          name = ?,
          description = ?,
          instructions = ?,
          video_url = ?,
          thumbnail_url = ?,
          sid = ?,
          dlid = ?,
          duration_minutes = ?,
          equipment_needed = ?
        WHERE eid = ?
        `,
        [
          name,
          description,
          instructions,
          video_url ?? null,
          thumbnail_url ?? null,
          sid,
          dlid,
          duration_minutes,
          equipment_needed ?? null,
          eid,
        ],
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "exercise not found" });
      }

      return res.json({ status: "ok" });
    } catch (err) {
      console.error("update exercise failed:", err);
      return res.status(500).json({ error: "internal server error" });
    }
  },
);

router.get(
  "/exercises/:eid",
  requireAuth,
  requireRole("owner"),
  async (req, res) => {
    try {
      const eid = Number(req.params.eid);
      if (!Number.isInteger(eid)) {
        return res.status(400).json({ error: "invalid exercise id" });
      }

      const [rows] = await db.query(
        `
        SELECT
          eid,
          name,
          description,
          instructions,
          video_url,
          thumbnail_url,
          sid,
          dlid,
          duration_minutes,
          equipment_needed,
          created_by,
          created_at,
          updated_at
        FROM exercises
        WHERE eid = ?
        LIMIT 1
        `,
        [eid],
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: "exercise not found" });
      }

      return res.json(rows[0]);
    } catch (err) {
      console.error("get exercise failed:", err);
      return res.status(500).json({ error: "internal server error" });
    }
  },
);

router.get(
  "/exercises/all",
  requireAuth,
  requireRole("user"),
  async (req, res) => {
    async (req, res) => {
      try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.max(
          1,
          Math.min(100, parseInt(req.query.limit) || 10),
        );

        const offset = (page - 1) * limit;

        const [countResult] = await db.query(
          `SELECT COUNT(*) as total FROM exercises`,
        );

        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        const [rows] = await db.query(
          `
        SELECT
          e.*,

          v.url AS video_url,
          t.url AS thumbnail_url

        FROM exercises e

        LEFT JOIN media v ON e.video_mid = v.mid
        LEFT JOIN media t ON e.thumbnail_mid = t.mid

        ORDER BY e.created_at DESC
        LIMIT ? OFFSET ?
      `,
          [limit, offset],
        );

        return res.json({
          count: rows.length,
          total,
          page,
          limit,
          totalPages,
          exercises: rows,
        });
      } catch (err) {
        console.error("fetch exercises failed:", err);
        return res.status(500).json({ error: "internal server error" });
      }
    };
  },
);

export default router;
