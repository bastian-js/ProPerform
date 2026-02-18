import express from "express";
import regenerateCodeRoutes from "./regenerateCodeRoutes.js";
import linkAthleteRoutes from "./linkAthleteRoutes.js";

const router = express.Router();

router.use(regenerateCodeRoutes);
router.use(linkAthleteRoutes);

export default router;
