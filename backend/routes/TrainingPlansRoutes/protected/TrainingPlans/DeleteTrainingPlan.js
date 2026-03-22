import express from "express";
import { db } from "../../../../db.js";
import { requireAuth } from "../../../../middleware/auth.js";

const router = express.Router();

router.delete("/:tpid", requireAuth, async (req, res) => {
  const { tpid } = req.params;
  const userId = req.user.uid;

  try {
    const [result] = await db.query(
      "DELETE FROM training_plans WHERE tpid = ? AND created_by_user = ?",
      [tpid, userId],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "training plan not found." });
    }

    res.json({
      message: "training plan deleted successfully.",
      rowsAffected: result.affectedRows,
      id: tpid,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
