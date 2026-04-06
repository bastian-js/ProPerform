import express from "express";
import { requireAuth } from "../../../middleware/auth.js";
import { requireRole } from "../../../middleware/role.js";
import { db } from "../../../db.js";

const router = express.Router();

router.get(
  "/users/:idOrName",
  requireAuth,
  requireRole("owner"),
  async (req, res) => {
    const { idOrName } = req.params;

    if (!idOrName) {
      return res
        .status(400)
        .json({ success: false, message: "idOrName is required." });
    }

    // username
    if (isNaN(idOrName)) {
      const [users] = await db.query(
        `
        SELECT uid, firstname, email FROM users WHERE firstname LIKE ?
        `,
        [`%${idOrName}%`],
      );
      return res.json(users);
    } else {
      // id
      const [users] = await db.query(
        `
          SELECT uid, firstname, email FROM users WHERE uid = ?
          `,
        [idOrName],
      );

      if (users.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "user not found." });
      }

      return res.json(users);
    }
  },
);

export default router;
