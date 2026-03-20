import express from "express";
import createExerciseRoutes from "./createExercise.js";
import deleteExerciseRoutes from "./deleteExercise.js";
import updateExerciseRoutes from "./updateExercise.js";
import getMuscleGroups from "./getMuscleGroups.js";

const router = express.Router();

router.use(createExerciseRoutes);
router.use(deleteExerciseRoutes);
router.use(updateExerciseRoutes);
router.use(getMuscleGroups);

export default router;
