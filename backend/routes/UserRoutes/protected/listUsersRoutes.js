import express from "express";
import { db } from "../../../db.js";
import { requireAuth } from "../../../middleware/auth.js";
import { createRateLimiter } from "../../../middleware/rate.js";

const router = express.Router();

const ROLES = {
  OWNER: 1,
  USER: 2,
  TRAINER: 3,
};

const getUsers = async (req, res, role) => {
  try {
    const roleParam = role?.toLowerCase();

    const validRoles = ["owners", "users", "trainers"];
    if (roleParam && !validRoles.includes(roleParam)) {
      return res.status(400).json({
        error:
          "invalid role value. allowed values: 'owners', 'users', 'trainers'.",
      });
    }

    // pagination
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const offset = (page - 1) * limit;

    let allUsers = [];

    // owners
    if (!roleParam || roleParam === "owners") {
      const [owners] = await db.execute(
        "SELECT uid, firstname, birthdate, email, role_id FROM users WHERE role_id = ?",
        [ROLES.OWNER],
      );
      allUsers.push(...owners.map((o) => ({ ...o, type: "owner" })));
    }

    // users
    if (!roleParam || roleParam === "users") {
      const [users] = await db.execute(
        "SELECT uid, firstname, birthdate, email, role_id FROM users WHERE role_id = ?",
        [ROLES.USER],
      );
      allUsers.push(...users.map((u) => ({ ...u, type: "user" })));
    }

    // trainers
    if (!roleParam || roleParam === "trainers") {
      const [trainers] = await db.execute(
        "SELECT tid, firstname, lastname, birthdate, email, phone_number FROM trainers",
      );
      allUsers.push(
        ...trainers.map((t) => ({
          tid: t.tid,
          firstname: t.firstname,
          lastname: t.lastname,
          birthdate: t.birthdate,
          email: t.email,
          phone_number: t.phone_number,
          type: "trainer",
        })),
      );
    }

    // optional: sort by newest id first
    allUsers.sort((a, b) => {
      const aId = a.uid ?? a.tid;
      const bId = b.uid ?? b.tid;
      return bId - aId;
    });

    const total = allUsers.length;
    const paginatedUsers = allUsers.slice(offset, offset + limit);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      users: paginatedUsers,
    });
  } catch (err) {
    console.error("failed to fetch users.", err);
    res.status(500).json({
      error: "failed to fetch users.",
    });
  }
};

router.get(
  "/",
  requireAuth,
  createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10 }),
  async (req, res) => {
    await getUsers(req, res, null);
  },
);

router.get(
  "/:role",
  requireAuth,
  createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10 }),
  async (req, res) => {
    await getUsers(req, res, req.params.role);
  },
);

export default router;
