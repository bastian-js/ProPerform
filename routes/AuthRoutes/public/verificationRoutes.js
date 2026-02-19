import express from "express";
import crypto from "crypto";
import { db } from "../../../db.js";
import { mailer } from "../../../functions/mailer.js";
import bcrypt from "bcrypt";
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
      subject: "New Verification Code",

      text: `
Hello ${firstname},

Here is your new verification code:

${rawCode}

Important: This code is valid for 15 minutes.

If you did not request this code, you can safely ignore this email.
`,

      html: `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
      .container { max-width: 500px; margin: 0 auto; padding: 20px; }
      .email-wrapper { background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden; }
      .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
      .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
      .content { padding: 40px 30px; }
      .greeting { font-size: 16px; color: #333; margin: 0 0 24px 0; }
      .code-section { background: #f9f9f9; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0; border-radius: 4px; }
      .code-label { font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
      .code { font-size: 32px; font-weight: 700; color: #667eea; letter-spacing: 4px; font-family: 'Courier New', monospace; margin: 0; }
      .info { font-size: 13px; color: #666; margin: 20px 0 0 0; line-height: 1.6; }
      .footer { background: #f9f9f9; padding: 20px 30px; border-top: 1px solid #eee; font-size: 12px; color: #999; line-height: 1.6; }
      .footer a { color: #667eea; text-decoration: none; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="email-wrapper">
        <div class="header">
          <h1>ProPerform</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Email Verification</p>
        </div>

        <div class="content">
          <p class="greeting">Hello ${firstname},</p>

          <p style="font-size: 15px; color: #555; line-height: 1.6;">
            Here is your new verification code. Please use the code below to complete your verification process:
          </p>

          <div class="code-section">
            <div class="code-label">Verification Code</div>
            <p class="code">${rawCode}</p>
          </div>

          <p class="info">
            <strong>⏱️ Important:</strong> This code is valid for <strong>15 minutes</strong>.
          </p>

          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            If you did not request this code, you can safely ignore this email.
          </p>
        </div>

        <div class="footer">
          <p style="margin: 0;">
            <strong>ProPerform</strong> | <a href="https://properform.app">properform.app</a><br>
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

    // ✅ Kein Email Enumeration Leak
    const firstname = rows.length ? rows[0].firstname : "there";

    // ✅ Alte Tokens löschen
    await db.query(`DELETE FROM password_resets WHERE email = ?`, [email]);

    // ✅ Neuer Token
    const rawToken = crypto.randomBytes(32).toString("hex");

    // ✅ Token hashen
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

    // ✅ DEV ONLY → extrem praktisch 😄
    console.log("RESET TOKEN:", rawToken);

    await mailer.sendMail({
      from: '"ProPerform" <no-reply@properform.app>',
      to: email,
      subject: "Reset your password",

      text: `
Hello ${firstname},

You requested a password reset for your ProPerform account.

Reset your password here:
${resetLink}

Important: This link is valid for 15 minutes.

If you did not request this reset, simply ignore this email.
`,

      html: `
        <h2>Password Reset</h2>
        <p>Hello ${firstname},</p>
        <p>You requested a password reset.</p>
        <a href="${resetLink}">Reset Password</a>
        <p>This link is valid for 15 minutes.</p>
      `,
    });

    // ✅ Immer gleiche Antwort → Security Best Practice
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
