import express from "express";
import uploadMediaRoutes from "./uploadMedia.js";
import listMediaRoutes from "./listMedia.js";
import deleteMediaRoutes from "./deleteMedia.js";
import updateMediaRoutes from "./updateMedia.js";
import getMediaById from "./getMediaById.js";

const router = express.Router();

router.use(uploadMediaRoutes);
router.use(listMediaRoutes);
router.use(deleteMediaRoutes);
router.use(updateMediaRoutes);
router.use(getMediaById);

export default router;
