import express from "express";
import bcrypt from "bcrypt";
import { db } from "../../../db.js";
import jwt from "jsonwebtoken";

import { requireRole } from "../../../middleware/role.js";
import { createRateLimiter } from "../../../middleware/rate.js";
import { requireAuth } from "../../../middleware/auth.js";

import { generateTrainerCode } from "../../../helpers/TrainerFunctions.js";

const router = express.Router();

const SALT_ROUNDS = 10;

router.post(
  "/trainers/register",
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
      return res.status(400).json({ error: "required fields missing." });
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

      const token = jwt.sign(
        { uid: result.insertId, role: "trainer" },
        process.env.JWT_SECRET,
        {
          expiresIn: "3d",
        },
      );

      res.status(201).json({
        message: `trainer ${firstname} ${lastname} created.`,
        trainerId: result.insertId,
        invite_code: trainerCode,
        token,
      });
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return res
          .status(409)
          .json({ error: "a trainer with this email already exists." });
      }

      res.status(500).json({ error: error.message });
    }
  },
);

router.post("/trainers/login", async (req, res) => {
  let { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: "please fill all required fields.",
    });
  }

  email = email.trim().toLowerCase();

  try {
    const [rows] = await db.query("SELECT * FROM trainers WHERE email = ?", [
      email,
    ]);

    if (!rows.length) {
      return res.status(401).json({
        error: "invalid credentials.",
      });
    }

    const trainer = rows[0];

    const valid = await bcrypt.compare(password, trainer.password_hash);

    if (!valid) {
      return res.status(401).json({
        error: "invalid credentials.",
      });
    }

    const token = jwt.sign(
      { tid: trainer.tid, role: "trainer" },
      process.env.JWT_SECRET,
      {
        expiresIn: "3d",
      },
    );

    return res.status(200).json({
      message: "login successful.",
      token,
      tid: trainer.tid,
      role: "trainer",
    });
  } catch (error) {
    console.error("trainer login error.", error);
    return res.status(500).json({
      error: "internal server error.",
    });
  }
});

export default router;
