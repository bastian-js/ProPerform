import express from "express";
import createExerciseRoutes from "./createExercise.js";
import listExercisesRoutes from "./listExercises.js";
import deleteExerciseRoutes from "./deleteExercise.js";
import updateExerciseRoutes from "./updateExercise.js";
import getExerciseRoutes from "./getExercise.js";
import listExercisesAllRoutes from "./listExercisesAll.js";

const router = express.Router();

router.use(createExerciseRoutes);
router.use(listExercisesRoutes);
router.use(deleteExerciseRoutes);
router.use(updateExerciseRoutes);
router.use(getExerciseRoutes);
router.use(listExercisesAllRoutes);

export default router;
