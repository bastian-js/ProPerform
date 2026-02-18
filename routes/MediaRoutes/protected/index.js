import express from "express";
import uploadMediaRoutes from "./uploadMedia.js";
import listMediaRoutes from "./listMedia.js";
import deleteMediaRoutes from "./deleteMedia.js";
import updateMediaRoutes from "./updateMedia.js";

const router = express.Router();

router.use(uploadMediaRoutes);
router.use(listMediaRoutes);
router.use(deleteMediaRoutes);
router.use(updateMediaRoutes);

export default router;
