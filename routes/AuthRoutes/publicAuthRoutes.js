import express from "express";
import bcrypt from "bcrypt";
import { db } from "../../db.js";
import jwt from "jsonwebtoken";

import { requireRole } from "../../middleware/role.js";
import { createRateLimiter } from "../../middleware/rate.js";

const router = express.Router();

const saltRounds = 10;

router.post(
  "/admin/register",
  createRateLimiter({ windowMs: 15 * 60 * 1000, max: 5 }),
  requireRole("owner"),
  async (req, res) => {
    const { firstname, birthdate, email, password_hash } = req.body;

    if (!firstname || !birthdate || !email || !password_hash)
      return res.status(400).json({ error: "Pflichtfelder fehlen" });

    try {
      const hashedPassword = await bcrypt.hash(password_hash, saltRounds);
      await db.execute(
        "INSERT INTO users (firstname, birthdate, email, password_hash, role_id) VALUES (?, ?, ?, ?, 1)",
        [firstname, birthdate || null, email, hashedPassword],
      );
      res.status(201).json({ message: `Admin ${firstname} registriert.` });
    } catch (error) {
      console.error("Admin-Registrierungsfehler:", error);
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
        .json({ error: "E-Mail und Passwort sind erforderlich" });

    try {
      const [rows] = await db.execute(
        "SELECT * FROM users WHERE email = ? AND role_id = 1",
        [email],
      );

      if (rows.length === 0)
        return res
          .status(401)
          .json({ error: "Ungültige Anmeldeinformationen" });

      const user = rows[0];
      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid)
        return res
          .status(401)
          .json({ error: "Ungültige Anmeldeinformationen" });

      const token = jwt.sign(
        { id: user.id, email: user.email, role: "owner" },
        process.env.JWT_SECRET,
        { expiresIn: "1h" },
      );

      res.json({ message: "Admin-Login erfolgreich", token });
    } catch (error) {
      console.error("Admin-Anmeldefehler:", error);
      res.status(500).json({ error: "Serverfehler: " + error.message });
    }
  },
);

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
      !training_frequency ||
      !primary_goal
    ) {
      return res
        .status(400)
        .json({ error: "Bitte füllen Sie alle erforderlichen Felder aus." });
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#_-])[A-Za-z\d@$!%*?&#_-]{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error:
          "Das Passwort muss mindestens 8 Zeichen lang sein und mindestens einen Großbuchstaben, einen Kleinbuchstaben, eine Zahl und ein Sonderzeichen enthalten.",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Die E-Mail-Adresse ist ungültig.",
      });
    }

    try {
      const role_id = 2;

      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const [result] = await db.execute(
        "INSERT INTO users (firstname, birthdate, email, password_hash, weight, height, gender, onboarding_completed, fitness_level, training_frequency, primary_goal, role_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
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
        ],
      );

      res.status(201).json({
        message: "Benutzer erfolgreich erstellt",
        uid: result.insertId,
      });
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ error: "E-Mail bereits registriert." });
      }

      console.error("Fehler beim Erstellen des Benutzers:", error);
      res.status(500).json({
        message: "Fehler beim Erstellen des Benutzers",
        error: error.message,
      });
    }
  },
);

router.post(
  "/login",
  createRateLimiter({ windowMs: 15 * 60 * 1000, max: 5 }),
  async (req, res) => {
    let { email, password, stayLoggedIn } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Bitte alle erforderlichen Felder ausfüllen",
      });
    }

    email = email.toLowerCase().trim();

    if (stayLoggedIn !== undefined && typeof stayLoggedIn !== "boolean") {
      return res.status(400).json({
        error: "Ungültiger Wert für 'stayLoggedIn'",
      });
    }

    const stayLoggedInSafe = stayLoggedIn === true;

    try {
      const [rows] = await db.query(
        "SELECT * FROM users WHERE email = ? LIMIT 1",
        [email],
      );

      if (rows.length === 0) {
        return res.status(401).json({
          error: "Ungültige Zugangsdaten",
        });
      }

      const user = rows[0];

      const passwordIsValid = await bcrypt.compare(
        password,
        user.password_hash,
      );

      if (!passwordIsValid) {
        return res.status(401).json({
          error: "Ungültige Zugangsdaten",
        });
      }

      const tokenExpiresIn = stayLoggedInSafe ? "60d" : "3d";

      const token = jwt.sign(
        { id: user.id, role: "user" },
        process.env.JWT_SECRET,
        { expiresIn: tokenExpiresIn },
      );

      return res.json({
        message: "Login erfolgreich",
        token,
        uid: user.id,
      });
    } catch (err) {
      console.error("Fehler beim Login:", err);
      return res.status(500).json({
        error: "Interner Serverfehler",
      });
    }
  },
);

router.post(
  "/trainers/login",
  createRateLimiter({ windowMs: 15 * 60 * 1000, max: 5 }),
  async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Bitte alle erforderlichen Felder ausfüllen",
      });
    }

    try {
      const [rows] = await db.query(
        "SELECT * FROM trainers WHERE email = ? LIMIT 1",
        [email],
      );

      if (rows.length === 0) {
        return res.status(401).json({
          error: "Ungültige Zugangsdaten",
        });
      }

      const trainer = rows[0];

      const passwordIsValid = await bcrypt.compare(
        password,
        trainer.password_hash,
      );

      if (!passwordIsValid) {
        return res.status(401).json({
          error: "Ungültige Zugangsdaten",
        });
      }

      const token = jwt.sign(
        { id: trainer.tid, role: "trainer" },
        process.env.JWT_SECRET,
        { expiresIn: "3d" },
      );

      return res.json({
        message: "Login erfolgreich",
        token,
        tid: trainer.tid,
      });
    } catch (err) {
      console.error("Fehler beim Trainer-Login:", err);
      return res.status(500).json({
        error: "Interner Serverfehler",
      });
    }
  },
);

export default router;
