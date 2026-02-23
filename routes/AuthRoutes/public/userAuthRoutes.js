import express from "express";
import bcrypt from "bcrypt";
import { db } from "../../../db.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { mailer } from "../../../helpers/mailer.js";

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

      const rawCode = String(Math.floor(Math.random() * 900000) + 100000);

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

      try {
        await mailer.sendMail({
          from: '"ProPerform" <no-reply@properform.app>',
          to: email,
          subject: "Confirm your email address",

          text: `
Hi ${firstname},

thank you for signing up for ProPerform.

Your verification code is:

${rawCode}

Important: This code is valid for 15 minutes.

If you did not sign up, you can safely ignore this email.

– The ProPerform Team
properform.app
`,

          html: `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: #0d0e10;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 480px;
        margin: 0 auto;
        padding: 32px 16px;
      }
      .card {
        background: #111214;
        border-radius: 16px;
        border: 1px solid rgba(255,255,255,0.07);
        overflow: hidden;
      }
      .header {
        padding: 36px 36px 28px;
        border-bottom: 1px solid rgba(255,255,255,0.06);
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #1F3A8A;
        display: inline-block;
        margin-right: 2px;
      }
      .brand {
        font-size: 15px;
        font-weight: 600;
        color: rgba(255,255,255,0.9);
        letter-spacing: -0.01em;
      }
      .content {
        padding: 36px;
      }
      .greeting {
        font-size: 20px;
        font-weight: 600;
        color: #ffffff;
        margin: 0 0 12px 0;
        letter-spacing: -0.02em;
      }
      .body-text {
        font-size: 14px;
        color: rgba(255,255,255,0.45);
        line-height: 1.65;
        margin: 0 0 28px 0;
      }
      .code-box {
        background: rgba(31,58,138,0.08);
        border: 1px solid rgba(31,58,138,0.2);
        border-radius: 12px;
        padding: 24px;
        margin: 0 0 28px 0;
        text-align: center;
      }
      .code-label {
        font-size: 11px;
        color: rgba(255,255,255,0.25);
        text-transform: uppercase;
        letter-spacing: 0.08em;
        margin-bottom: 12px;
      }
      .code {
        font-size: 36px;
        font-weight: 700;
        color: #ffffff;
        letter-spacing: 10px;
        font-family: 'Courier New', monospace;
        margin: 0;
      }
      .notice {
        background: rgba(31,58,138,0.08);
        border: 1px solid rgba(31,58,138,0.2);
        border-radius: 10px;
        padding: 14px 16px;
        font-size: 13px;
        color: rgba(255,255,255,0.4);
        line-height: 1.55;
      }
      .notice strong { color: rgba(255,255,255,0.65); }
      .footer {
        padding: 20px 36px;
        border-top: 1px solid rgba(255,255,255,0.06);
      }
      .footer p {
        font-size: 11.5px;
        color: rgba(255,255,255,0.2);
        line-height: 1.6;
        margin: 0;
      }
      .footer a {
        color: rgba(255,255,255,0.3);
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="card">

        <div class="header">
          <span class="dot"></span>
          <span class="brand">ProPerform</span>
        </div>

        <div class="content">
          <p class="greeting">Hi ${firstname},</p>
          <p class="body-text">
            thank you for signing up! To activate your account, please use the verification code below.
          </p>

          <div class="code-box">
            <p class="code-label">Verification code</p>
            <p class="code">${rawCode}</p>
          </div>

          <div class="notice">
            <strong>⏱ This code is valid for 15 minutes.</strong><br>
            If you did not sign up for ProPerform, you can safely ignore this email.
          </div>
        </div>

        <div class="footer">
          <p>
            <strong style="color:rgba(255,255,255,0.3)">ProPerform</strong> &nbsp;·&nbsp;
            <a href="https://properform.app">properform.app</a><br>
            This is an automatically generated email. Please do not reply to this message.
          </p>
        </div>

      </div>
    </div>
  </body>
</html>
`,
        });
      } catch (err) {
        return res.json({
          message: "failed to send verification email.",
          error: err.message,
        });
      }

      const token = jwt.sign({ uid: user.uid }, process.env.JWT_SECRET, {
        expiresIn: stayLoggedIn ? "60d" : "3d",
      });

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

    const token = jwt.sign({ uid: user.uid }, process.env.JWT_SECRET, {
      expiresIn: stayLoggedIn ? "60d" : "3d",
    });

    res.json({
      message: "login successful.",
      token,
      uid: user.uid,
    });
  } catch {
    res.status(500).json({ error: "internal server error." });
  }
});

export default router;
