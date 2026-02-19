import express from "express";
import bcrypt from "bcrypt";
import { db } from "../../../db.js";
import jwt from "jsonwebtoken";

import { requireRole } from "../../../middleware/role.js";
import { createRateLimiter } from "../../../middleware/rate.js";
import { requireAuth } from "../../../middleware/auth.js";

const router = express.Router();

const saltRounds = 10;

router.post(
  "/admin/register",
  createRateLimiter({ windowMs: 15 * 60 * 1000, max: 5 }),
  requireAuth,
  requireRole("owner"),
  async (req, res) => {
    const { firstname, birthdate, email, password_hash } = req.body;

    if (!firstname || !birthdate || !email || !password_hash)
      return res.status(400).json({ error: "required fields missing." });

    try {
      const hashedPassword = await bcrypt.hash(password_hash, saltRounds);

      await db.execute(
        "INSERT INTO users (firstname, birthdate, email, password_hash, role_id) VALUES (?, ?, ?, ?, 1)",
        [firstname, birthdate || null, email, hashedPassword],
      );

      res.status(201).json({ message: `admin ${firstname} registered.` });
    } catch (error) {
      console.error("admin registration error:", error);
      res.status(500).json({ error: error.message });
    }
  },
);

router.post(
  "/admin/login",
  createRateLimiter({ windowMs: 15 * 60 * 1000, max: 5 }),
  async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .json({ error: "email and password are required." });

    try {
      const [rows] = await db.execute(
        "SELECT * FROM users WHERE email = ? AND role_id = 1",
        [email],
      );

      if (rows.length === 0)
        return res.status(401).json({ error: "invalid credentials." });

      const user = rows[0];

      const valid = await bcrypt.compare(password, user.password_hash);

      if (!valid)
        return res.status(401).json({ error: "invalid credentials." });

      const token = jwt.sign(
        { uid: user.uid, email: user.email, role: "owner" },
        process.env.JWT_SECRET,
        { expiresIn: "1h" },
      );

      res.json({ message: "admin login successful.", token });
    } catch (error) {
      console.error("admin login error:", error);
      res.status(500).json({ error: "server error: " + error.message });
    }
  },
);

export default router;
