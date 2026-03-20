import express from "express";
import regenerateCodeRoutes from "./regenerateCodeRoutes.js";
import linkAthleteRoutes from "./linkAthleteRoutes.js";
import deleteTrainer from "./deleteTrainer.js";
import deleteTrainerToUser from "./deleteTrainerToUser.js";
import trainerAthleteRoutes from "./trainerAthleteRoutes.js";
import trainersMe from "./trainersMe.js";
import TrainerToUserRoutes from "./TrainerToUserRoutes.js";

const router = express.Router();

router.use(regenerateCodeRoutes);
router.use(linkAthleteRoutes);
router.use(deleteTrainer);
router.use(deleteTrainerToUser);
router.use(trainerAthleteRoutes);
router.use(trainersMe);
router.use(TrainerToUserRoutes);

export default router;
