import express from "express";
import bcrypt from "bcrypt";
import { db } from "../../../db.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { mailer } from "../../../helpers/mailer.js";

import { buildVerificationEmail } from "../../../helpers/buildMails.js";

import { createRateLimiter } from "../../../middleware/rate.js";

const router = express.Router();

const saltRounds = Number(process.env.SALT_ROUNDS) || 10;

router.post(
  "/register",
  createRateLimiter({ windowMs: 15 * 60 * 1000, max: 5 }),
  async (req, res) => {
    const {
      firstname,
      birthdate,
      email,
      password,
      weight,
      height,
      gender,
      onboarding_completed,
      fitness_level,
      training_frequency,
      primary_goal,
      stayLoggedIn,
    } = req.body;

    if (
      !firstname ||
      !birthdate ||
      !email ||
      !password ||
      weight == null ||
      height == null ||
      !gender ||
      onboarding_completed === undefined ||
      !fitness_level ||
      training_frequency == null ||
      !primary_goal
    ) {
      return res
        .status(400)
        .json({ error: "please fill all required fields." });
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#_-])[A-Za-z\d@$!%*?&#_-]{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error:
          "password must be at least 8 characters long and contain uppercase, lowercase, number, and special character.",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "invalid email address.",
      });
    }

    try {
      const role_id = 2;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const rawCode = String(crypto.randomInt(100000, 1000000));

      const codeHash = crypto
        .createHash("sha256")
        .update(rawCode)
        .digest("hex");

      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      const [result] = await db.execute(
        "INSERT INTO users (firstname, birthdate, email, password_hash, weight, height, gender, onboarding_completed, fitness_level, training_frequency, primary_goal, role_id, email_verification_code, email_verification_expires) VALUES (?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          firstname,
          birthdate,
          email,
          hashedPassword,
          weight,
          height,
          gender,
          onboarding_completed,
          fitness_level,
          training_frequency,
          primary_goal,
          role_id,
          codeHash,
          expiresAt,
        ],
      );

      const token = jwt.sign({ uid: result.insertId }, process.env.JWT_SECRET, {
        expiresIn: stayLoggedIn ? "60d" : "3d",
      });

      try {
        const { subject, text, html } = buildVerificationEmail(
          firstname,
          rawCode,
        );

        await mailer.sendMail({
          from: '"ProPerform" <no-reply@properform.app>',
          to: email,
          subject: subject,
          text: text,
          html: html,
        });
      } catch (err) {
        return res.status(201).json({
          message: "user created but verification email failed.",
          error: err.message,
        });
      }

      res.status(201).json({
        message: "user successfully created.",
        token,
        uid: result.insertId,
      });
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ error: "email already registered." });
      }

      res.status(500).json({
        message: "failed to create user.",
        error: error.message,
      });
    }
  },
);

router.post("/login", async (req, res) => {
  let { email, password, stayLoggedIn } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: "please fill all required fields.",
    });
  }

  if (stayLoggedIn !== undefined && typeof stayLoggedIn !== "boolean") {
    return res.status(400).json({
      error: "invalid value for stayloggedin.",
    });
  }

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (!rows.length)
      return res.status(401).json({ error: "invalid credentials." });

    const user = rows[0];

    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) return res.status(401).json({ error: "invalid credentials." });

    const userRole = user.role_id === 1 ? "owner" : "user";

    const token = jwt.sign(
      { uid: user.uid, role: userRole },
      process.env.JWT_SECRET,
      {
        expiresIn: stayLoggedIn ? "60d" : "3d",
      },
    );

    res.json({
      message: "login successful.",
      token,
      uid: user.uid,
      role: userRole,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "internal server error.", error: error.message });
  }
});

export default router;
