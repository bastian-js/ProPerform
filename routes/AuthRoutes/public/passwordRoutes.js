import express from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { db } from "../../../db.js";
import { mailer } from "../../../helpers/mailer.js";

const router = express.Router();

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 10;

router.post("/reset-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      error: "email required.",
    });
  }

  try {
    const [rows] = await db.query(
      `SELECT firstname FROM users WHERE email = ?`,
      [email],
    );

    const firstname = rows.length ? rows[0].firstname : "there";

    await db.query(`DELETE FROM password_resets WHERE email = ?`, [email]);

    const rawToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const expires = new Date(Date.now() + 15 * 60 * 1000);

    await db.query(
      `INSERT INTO password_resets (email, token, expires_at)
       VALUES (?, ?, ?)`,
      [email, hashedToken, expires],
    );

    const resetLink = `https://account.properform.app/reset-password/${rawToken}`;

    await mailer.sendMail({
      from: '"ProPerform" <no-reply@properform.app>',
      to: email,
      subject: "Reset your password",

      text: `
Hi ${firstname},

you requested a password reset for your ProPerform account.

Reset your password here:
${resetLink}

Important: This link is valid for 15 minutes.

If you did not request this, you can safely ignore this email.

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
        margin: 0 0 32px 0;
      }
      .btn-wrap {
        margin: 0 0 32px 0;
      }
      .btn {
        display: inline-block;
        background: #1F3A8A;
        color: #ffffff !important;
        text-decoration: none;
        font-size: 14px;
        font-weight: 500;
        padding: 13px 28px;
        border-radius: 10px;
        letter-spacing: -0.01em;
      }
      .link-fallback {
        margin: 0 0 28px 0;
      }
      .link-label {
        font-size: 11px;
        color: rgba(255,255,255,0.25);
        text-transform: uppercase;
        letter-spacing: 0.08em;
        margin-bottom: 8px;
      }
      .link-url {
        font-size: 12px;
        color: rgba(255,255,255,0.3);
        word-break: break-all;
        line-height: 1.5;
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
            you requested a password reset for your ProPerform account.
            Click the button below to set a new password.
          </p>

          <div class="btn-wrap">
            <a href="${resetLink}" class="btn">Reset password</a>
          </div>

          <div class="link-fallback">
            <p class="link-label">Or copy this link</p>
            <p class="link-url">${resetLink}</p>
          </div>

          <div class="notice">
            <strong>⏱ This link is valid for 15 minutes.</strong><br>
            If you did not request this, you can safely ignore this email.
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

    return res.status(200).json({
      message: "If an account exists, a reset email has been sent.",
    });
  } catch (err) {
    return res.status(500).json({
      error: "failed to send reset email.",
      details: err.message,
    });
  }
});

router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ message: "password is required." });
  }

  if (password.length < 8) {
    return res.status(400).json({
      message: "Password must be at least 8 characters.",
    });
  }

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const [rows] = await db.query(
      `SELECT * FROM password_resets WHERE token = ?`,
      [hashedToken],
    );

    if (!rows.length) {
      return res.status(400).json({ message: "invalid token." });
    }

    const reset = rows[0];

    if (new Date(reset.expires_at) < new Date()) {
      return res.status(400).json({ message: "token expired." });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    await db.query(`UPDATE users SET password_hash = ? WHERE email = ?`, [
      hashedPassword,
      reset.email,
    ]);

    await db.query(`DELETE FROM password_resets WHERE email = ?`, [
      reset.email,
    ]);

    return res.status(200).json({
      message: "password updated successfully.",
    });
  } catch (err) {
    return res.status(500).json({
      message: "failed to reset password",
      error: err.message,
    });
  }
});

export default router;
