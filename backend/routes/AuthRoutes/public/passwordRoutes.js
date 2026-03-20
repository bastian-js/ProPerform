import express from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { db } from "../../../db.js";
import { mailer } from "../../../helpers/mailer.js";
import { buildResetPasswordEmail } from "../../../helpers/buildMails.js";

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

    const { subject, text, html } = buildResetPasswordEmail(
      firstname,
      resetLink,
    );

    mailer
      .sendMail({
        from: '"ProPerform" <no-reply@properform.app>',
        to: email,
        subject: subject,
        text: text,
        html: html,
      })
      .catch((err) => {
        console.error("failed to send reset email.", err);
      });

    return res.status(200).json({
      message: "if an account exists, a reset email has been sent.",
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
      message: "password must be at least 8 characters.",
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
      message: "failed to reset password.",
      error: err.message,
    });
  }
});

export default router;
