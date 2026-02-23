import express from "express";
import crypto from "crypto";
import { db } from "../../../db.js";
import { mailer } from "../../../helpers/mailer.js";
import dotenv from "dotenv";

const router = express.Router();

dotenv.config();

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 10;

router.post("/check-verification-code", async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code)
    return res.status(400).json({ error: "email and code are required." });

  try {
    const [rows] = await db.execute(
      `SELECT email_verification_code, email_verification_expires, email_verified FROM users WHERE email = ?`,
      [email],
    );

    if (!rows.length) return res.status(404).json({ error: "user not found." });

    if (rows[0].email_verified === 1)
      return res.status(400).json({ error: "email already verified." });

    const codeHash = crypto.createHash("sha256").update(code).digest("hex");

    if (rows[0].email_verification_code !== codeHash)
      return res
        .status(401)
        .json({ error: "invalid or expired verification code." });

    await db.execute(`UPDATE users SET email_verified = 1 WHERE email = ?`, [
      email,
    ]);

    res.json({ message: "verification code valid." });
  } catch {
    res.status(500).json({ error: "verification check failed." });
  }
});

router.post("/resend-verification-code", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      error: "email is required.",
    });
  }

  try {
    const [rows] = await db.execute(
      `SELECT uid, firstname, email_verified
       FROM users
       WHERE email = ?
       LIMIT 1`,
      [email],
    );

    if (rows.length === 0) {
      return res.status(200).json({
        message: "if the account exists, a verification email was sent.",
      });
    }

    const { uid, firstname, email_verified } = rows[0];

    if (email_verified === 1) {
      return res.status(400).json({
        error: "email already verified.",
      });
    }

    const rawCode = Math.floor(100000 + Math.random() * 900000).toString();

    const codeHash = crypto.createHash("sha256").update(rawCode).digest("hex");

    await db.execute(
      `UPDATE users
       SET email_verification_code = ?,
           email_verification_expires = DATE_ADD(NOW(), INTERVAL 15 MINUTE)
       WHERE uid = ?`,
      [codeHash, uid],
    );

    await mailer.sendMail({
      from: '"ProPerform" <no-reply@properform.app>',
      to: email,
      subject: "Your new verification code",

      text: `
Hi ${firstname},

here is your new verification code:

${rawCode}

Important: This code is valid for 15 minutes.

If you did not request this code, you can safely ignore this email.

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
            you requested a new verification code. Use the code below to complete your verification.
          </p>

          <div class="code-box">
            <p class="code-label">Verification code</p>
            <p class="code">${rawCode}</p>
          </div>

          <div class="notice">
            <strong>⏱ This code is valid for 15 minutes.</strong><br>
            If you did not request this code, you can safely ignore this email.
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
      message: "verification code resent.",
    });
  } catch (err) {
    return res.status(500).json({
      error: "failed to resend verification code.",
    });
  }
});

export default router;
