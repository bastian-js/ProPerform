import express from "express";
import { db } from "../../../../db.js";
import { requireAuth } from "../../../../middleware/auth.js";

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  const userId = req.user.uid;

  try {
    const [plans] = await db.query(
      `
      SELECT 
        utp.id,
        utp.uid,
        utp.tpid,
        utp.assigned_by_trainer,
        utp.start_date,
        utp.end_date,
        utp.completion_percentage,
        utp.status,
        utp.is_selected,
        utp.created_at,
        utp.updated_at,
        tp.name as plan_name
      FROM user_training_plans utp
      LEFT JOIN training_plans tp ON utp.tpid = tp.tpid
      WHERE utp.uid = ?
      ORDER BY utp.created_at DESC
      `,
      [userId],
    );

    res.status(200).json({
      message: "user training plans fetched successfully",
      plans,
    });
  } catch (error) {
    console.error("error fetching user training plans:", error);
    res.status(500).json({
      message: "error fetching user training plans",
      error: error.message,
    });
  }
});

export default router;
