import express from "express";
import GetStreaksByType from "./GetStreaksByType.js";
import UpdatedateStreak from "./UpdateStreak.js";

const router = express.Router();

router.use(GetStreaksByType);
router.use(UpdatedateStreak);

export default router;
