import express from "express";
import GetUsersByIdOrName from "./GetUsersByIdOrName.js";
import NotificationRoutes from "./notificationRoutes.js";

const router = express.Router();

router.use(GetUsersByIdOrName);
router.use(NotificationRoutes);

export default router;
