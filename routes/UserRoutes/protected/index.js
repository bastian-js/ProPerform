import express from "express";
import meRoutes from "./meRoutes.js";
import listUsersRoutes from "./listUsersRoutes.js";
import statsRoutes from "./statsRoutes.js";
import deleteUserRoutes from "./deleteUserRoutes.js";

const router = express.Router();

router.use(meRoutes);
router.use(listUsersRoutes);
router.use(statsRoutes);
router.use(deleteUserRoutes);

export default router;
