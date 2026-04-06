import express from "express";
import { db } from "../../../db.js";
import { requireAuth } from "../../../middleware/auth.js";
import { requireRole } from "../../../middleware/role.js";

const router = express.Router();

async function validateMediaOwnership(mediaId, ownerId, errorMessage) {
  const [rows] = await db.query(
    "SELECT mid FROM media WHERE mid = ? AND created_by_user = ? AND created_by_role = ?",
    [mediaId, ownerId, "trainer"],
  );

  if (rows.length === 0) {
    return errorMessage;
  }

  return null;
}

async function resolveTrainerCreatorUid(trainerId) {
  if (!trainerId) return null;

  const [rows] = await db.query(
    `SELECT u.uid
     FROM trainers t
     JOIN users u ON u.email = t.email
     JOIN role r ON r.rid = u.role_id
     WHERE t.tid = ? AND r.role_name = 'trainer'
     LIMIT 1`,
    [trainerId],
  );

  return rows.length > 0 ? rows[0].uid : null;
}

router.post(
  "/exercises",
  requireAuth,
  requireRole("trainer"),
  async (req, res) => {
    const trainerId = req.user.tid ?? req.user.uid ?? null;
    const creatorUid = await resolveTrainerCreatorUid(trainerId);
    const {
      name,
      description,
      instructions,
      video_mid,
      thumbnail_mid,
      video_media_id,
      thumbnail_media_id,
      sid,
      dlid,
      duration_minutes,
      equipment_needed,
    } = req.body;

    const resolvedVideoMid = video_mid ?? video_media_id;
    const resolvedThumbnailMid = thumbnail_mid ?? thumbnail_media_id;

    console.log("[trainerExercisesRoutes] create exercise request", {
      trainerId,
      creatorUid,
      body: {
        name,
        description,
        instructions,
        video_mid: resolvedVideoMid,
        thumbnail_mid: resolvedThumbnailMid,
        sid,
        dlid,
        duration_minutes,
        equipment_needed,
      },
    });

    if (!name || !sid || !dlid) {
      return res
        .status(400)
        .json({ error: "name, sid and dlid are required." });
    }

    const parsedSid = Number(sid);
    const parsedDlid = Number(dlid);
    const parsedDuration =
      duration_minutes === undefined ||
      duration_minutes === null ||
      duration_minutes === ""
        ? null
        : Number(duration_minutes);
    const parsedVideoMid = Number(resolvedVideoMid);
    const parsedThumbnailMid =
      resolvedThumbnailMid === undefined ||
      resolvedThumbnailMid === null ||
      resolvedThumbnailMid === ""
        ? null
        : Number(resolvedThumbnailMid);

    if (!Number.isInteger(parsedSid) || !Number.isInteger(parsedDlid)) {
      return res.status(400).json({ error: "sid and dlid must be integers." });
    }

    if (!Number.isInteger(parsedVideoMid) || parsedVideoMid <= 0) {
      return res
        .status(400)
        .json({ error: "video_mid must be a valid media id." });
    }

    if (
      parsedThumbnailMid !== null &&
      (!Number.isInteger(parsedThumbnailMid) || parsedThumbnailMid <= 0)
    ) {
      return res
        .status(400)
        .json({ error: "thumbnail_mid must be a valid media id." });
    }

    if (
      parsedDuration !== null &&
      (!Number.isInteger(parsedDuration) || parsedDuration < 0)
    ) {
      return res
        .status(400)
        .json({ error: "duration_minutes must be a positive integer." });
    }

    const videoOwnershipError = await validateMediaOwnership(
      parsedVideoMid,
      trainerId,
      "invalid video media",
    );

    if (videoOwnershipError) {
      return res.status(400).json({ error: videoOwnershipError });
    }

    if (parsedThumbnailMid !== null) {
      const thumbnailOwnershipError = await validateMediaOwnership(
        parsedThumbnailMid,
        trainerId,
        "invalid thumbnail media",
      );

      if (thumbnailOwnershipError) {
        return res.status(400).json({ error: thumbnailOwnershipError });
      }
    }

    try {
      const [result] = await db.query(
        `INSERT INTO exercises
         (name, description, instructions, video_mid, thumbnail_mid, sid, dlid, duration_minutes, equipment_needed, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name,
          description ?? null,
          instructions ?? null,
          parsedVideoMid,
          parsedThumbnailMid,
          parsedSid,
          parsedDlid,
          parsedDuration,
          equipment_needed ?? null,
          creatorUid,
        ],
      );

      console.log("[trainerExercisesRoutes] create exercise success", {
        eid: result.insertId,
        trainerId,
        creatorUid,
      });

      return res.status(201).json({ eid: result.insertId });
    } catch (err) {
      console.error("[trainerExercisesRoutes] create exercise failed", err);
      return res.status(500).json({ error: "failed" });
    }
  },
);

router.put(
  "/exercises/:eid",
  requireAuth,
  requireRole("trainer"),
  async (req, res) => {
    const eid = Number(req.params.eid);
    const trainerId = req.user.tid ?? req.user.uid ?? null;
    const creatorUid = await resolveTrainerCreatorUid(trainerId);
    const {
      name,
      description,
      instructions,
      video_mid,
      thumbnail_mid,
      sid,
      dlid,
      duration_minutes,
      equipment_needed,
    } = req.body;

    console.log("[trainerExercisesRoutes] update exercise request", {
      eid,
      trainerId,
      creatorUid,
      body: {
        name,
        description,
        instructions,
        video_mid,
        thumbnail_mid,
        sid,
        dlid,
        duration_minutes,
        equipment_needed,
      },
    });

    if (!Number.isInteger(eid)) {
      return res.status(400).json({ error: "invalid exercise id." });
    }

    if (!name || !sid || !dlid || video_mid === undefined) {
      return res.status(400).json({ error: "missing required fields." });
    }

    const parsedSid = Number(sid);
    const parsedDlid = Number(dlid);
    const parsedVideoMid = Number(video_mid);
    const parsedThumbnailMid =
      thumbnail_mid === undefined ||
      thumbnail_mid === null ||
      thumbnail_mid === ""
        ? null
        : Number(thumbnail_mid);
    const parsedDuration =
      duration_minutes === undefined ||
      duration_minutes === null ||
      duration_minutes === ""
        ? null
        : Number(duration_minutes);

    if (!Number.isInteger(parsedSid) || !Number.isInteger(parsedDlid)) {
      return res.status(400).json({ error: "sid and dlid must be integers." });
    }

    if (!Number.isInteger(parsedVideoMid) || parsedVideoMid <= 0) {
      return res
        .status(400)
        .json({ error: "video_mid must be a valid media id." });
    }

    if (
      parsedThumbnailMid !== null &&
      (!Number.isInteger(parsedThumbnailMid) || parsedThumbnailMid <= 0)
    ) {
      return res
        .status(400)
        .json({ error: "thumbnail_mid must be a valid media id." });
    }

    if (
      parsedDuration !== null &&
      (!Number.isInteger(parsedDuration) || parsedDuration < 0)
    ) {
      return res
        .status(400)
        .json({ error: "duration_minutes must be a positive integer." });
    }

    try {
      const [checkRows] = creatorUid
        ? await db.query(
            "SELECT eid FROM exercises WHERE eid = ? AND created_by = ?",
            [eid, creatorUid],
          )
        : await db.query(
            "SELECT eid FROM exercises WHERE eid = ? AND created_by IS NULL",
            [eid],
          );

      if (checkRows.length === 0) {
        return res.status(403).json({ error: "not yours" });
      }

      const videoOwnershipError = await validateMediaOwnership(
        parsedVideoMid,
        trainerId,
        "invalid video media",
      );

      if (videoOwnershipError) {
        return res.status(400).json({ error: videoOwnershipError });
      }

      if (parsedThumbnailMid !== null) {
        const thumbnailOwnershipError = await validateMediaOwnership(
          parsedThumbnailMid,
          trainerId,
          "invalid thumbnail media",
        );

        if (thumbnailOwnershipError) {
          return res.status(400).json({ error: thumbnailOwnershipError });
        }
      }

      const [result] = await db.query(
        `UPDATE exercises
         SET name = ?,
             description = ?,
             instructions = ?,
             video_mid = ?,
             thumbnail_mid = ?,
             sid = ?,
             dlid = ?,
             duration_minutes = ?,
             equipment_needed = ?
         WHERE eid = ? AND ${creatorUid ? "created_by = ?" : "created_by IS NULL"}`,
        [
          name,
          description ?? null,
          instructions ?? null,
          parsedVideoMid,
          parsedThumbnailMid,
          parsedSid,
          parsedDlid,
          parsedDuration,
          equipment_needed ?? null,
          eid,
          ...(creatorUid ? [creatorUid] : []),
        ],
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "exercise not found." });
      }

      console.log("[trainerExercisesRoutes] update exercise success", {
        eid,
        trainerId,
        creatorUid,
      });

      return res.json({ message: "updated" });
    } catch (err) {
      console.error("[trainerExercisesRoutes] update exercise failed", err);
      return res.status(500).json({ error: "failed" });
    }
  },
);

router.delete(
  "/exercises/:eid",
  requireAuth,
  requireRole("trainer"),
  async (req, res) => {
    const eid = Number(req.params.eid);
    const trainerId = req.user.tid ?? req.user.uid ?? null;
    const creatorUid = await resolveTrainerCreatorUid(trainerId);

    console.log("[trainerExercisesRoutes] delete exercise request", {
      eid,
      trainerId,
      creatorUid,
    });

    if (!Number.isInteger(eid)) {
      return res.status(400).json({ error: "invalid exercise id." });
    }

    try {
      const [result] = creatorUid
        ? await db.query(
            "DELETE FROM exercises WHERE eid = ? AND created_by = ?",
            [eid, creatorUid],
          )
        : await db.query(
            "DELETE FROM exercises WHERE eid = ? AND created_by IS NULL",
            [eid],
          );

      if (result.affectedRows === 0) {
        return res.status(403).json({ error: "not yours" });
      }

      console.log("[trainerExercisesRoutes] delete exercise success", {
        eid,
        trainerId,
        creatorUid,
      });

      return res.json({ message: "deleted" });
    } catch (err) {
      console.error("[trainerExercisesRoutes] delete exercise failed", err);
      return res.status(500).json({ error: "failed" });
    }
  },
);

export default router;
