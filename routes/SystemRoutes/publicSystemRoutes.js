import express from "express";

const router = express.Router();

router.get("/health", async (req, res) => {
  return res.status(200).json({ status: "ok" });
});

export default router;
