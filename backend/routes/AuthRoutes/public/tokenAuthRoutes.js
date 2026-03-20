import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { db } from "../../../db.js";

dotenv.config();

const router = express.Router();

router.post("/refresh", async (req, res) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    return res.status(401).json({ message: "refresh token is required." });
  }

  try {
    const payload = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET);

    if (!payload || payload.type !== "refresh") {
      return res.status(403).json({ message: "invalid token type." });
    }

    if (!payload.uid) {
      return res
        .status(403)
        .json({ message: "invalid refresh token payload." });
    }

    const [rows] = await db.query(
      `
        SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > NOW()
        `,
      [refresh_token],
    );

    if (!rows.length) {
      return res
        .status(403)
        .json({ message: "invalid or expired refresh token." });
    }

    const [userRows] = await db.query(
      `
        SELECT uid, email, role_id FROM users WHERE uid = ?
        `,
      [payload.uid],
    );

    if (!userRows.length) {
      return res.status(404).json({
        message: "user not found.",
      });
    }

    const user = userRows[0];

    const role = Number(user.role_id) === 2 ? "user" : "owner";

    const newAccessToken = jwt.sign(
      { uid: user.uid, email: user.email, role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" },
    );

    res.status(200).json({
      message: "new access token created.",
      access_token: newAccessToken,
    });
  } catch (err) {
    return res.status(403).json({
      error: "invalid or expired refresh token.",
      details: err.message,
    });
  }
});

export default router;
