import express from "express";
import crypto from "crypto";
import { db } from "../../../db.js";
import { mailer } from "../../../helpers/mailer.js";
import dotenv from "dotenv";
import { buildResendVerificationEmail } from "../../../helpers/buildMails.js";

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

    if (new Date(rows[0].email_verification_expires) < new Date()) {
      return res.status(401).json({ error: "verification code expired." });
    }

    const codeHash = crypto.createHash("sha256").update(code).digest("hex");

    if (rows[0].email_verification_code !== codeHash)
      return res
        .status(401)
        .json({ error: "invalid or expired verification code." });

    await db.execute(`UPDATE users SET email_verified = 1 WHERE email = ?`, [
      email,
    ]);

    res.json({ message: "verification code valid." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "verification check failed.", error: error.message });
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

    const { subject, text, html } = buildResendVerificationEmail(
      firstname,
      rawCode,
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
        console.error("failed to send verification email.", err);
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
