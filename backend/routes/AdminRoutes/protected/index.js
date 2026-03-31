import express from "express";
import GetUsersByIdOrName from "./GetUsersByIdOrName.js";
import NotificationRoutes from "./NotificationRoutes.js";

const router = express.Router();

router.use(GetUsersByIdOrName);
router.use(NotificationRoutes);

export default router;
