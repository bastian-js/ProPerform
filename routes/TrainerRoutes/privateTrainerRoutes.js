import express from "express";
import mysql from "mysql2/promise";
import { db } from "../../db.js";
import { requireAuth } from "../../middleware/auth.js";
import { generateTrainerCode } from "../../functions/TrainerFunctions.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { requireRole } from "../../middleware/role.js";
import { createRateLimiter } from "../../middleware/rate.js";

dotenv.config();

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS) || 10;

const router = express.Router();

router.post(
  "/createTrainer",
  requireAuth,
  requireRole("owner"),
  createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10 }),
  async (req, res) => {
    const { firstname, lastname, password, birthdate, email, phone_number } =
      req.body;

    if (
      !firstname ||
      !lastname ||
      !email ||
      !phone_number ||
      !birthdate ||
      !password
    ) {
      return res.status(400).json({ error: "Pflichtfelder fehlen" });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      const trainerCode = generateTrainerCode();

      const [result] = await db.execute(
        "INSERT INTO trainers (firstname, lastname, birthdate, email, password_hash, phone_number, invite_code) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          firstname,
          lastname,
          birthdate,
          email,
          hashedPassword,
          phone_number,
          trainerCode,
        ],
      );
      res.status(201).json({
        message: `Trainer ${firstname} ${lastname} erstellt.`,
        trainerId: result.insertId,
        invite_code: trainerCode,
      });
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return res
          .status(409)
          .json({ error: "Ein Trainer mit dieser E-Mail existiert bereits." });
      }

      res.status(500).json({ error: error.message });
    }
  },
);

router.post(
  "/verify-code",
  requireAuth,
  createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10 }),
  async (req, res) => {
    const { invite_code } = req.body;

    if (!invite_code || invite_code.trim() === "") {
      return res.status(400).json({ error: "Einladungscode fehlt." });
    }

    try {
      const [rows] = await db.execute(
        "SELECT tid, firstname, lastname, email, invite_code FROM trainers WHERE invite_code = ?",
        [invite_code.trim()],
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: "Ungültiger Einladungscode." });
      }

      res.status(200).json({
        valid: true,
        trainer: rows[0],
      });
    } catch (error) {
      console.error("Fehler bei /verify-code:", error);
      res.status(500).json({ error: "Interner Serverfehler." });
    }
  },
);

router.delete(
  "/deleteTrainer/:tid",
  requireAuth,
  requireRole("owner"),
  createRateLimiter({ windowMs: 15 * 60 * 1000, max: 5 }),
  async (req, res) => {
    const { tid } = req.params;

    try {
      const [result] = await db.execute("DELETE FROM trainers WHERE tid = ?", [
        tid,
      ]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Trainer nicht gefunden." });
      }

      res
        .status(200)
        .json({ message: `Trainer mit ID ${tid} wurde gelöscht.` });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

export default router;
