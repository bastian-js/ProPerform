import rateLimit from "express-rate-limit";

export function createRateLimiter({
  windowMs = 15 * 60 * 1000,
  max = 100,
  key = "ip",
} = {}) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,

    keyGenerator: (req) => {
      if (key === "user" && req.user?.id) {
        return `user:${req.user.id}`;
      }

      return req.ip;
    },

    handler: (req, res) => {
      res.status(429).json({
        error: "RATE_LIMIT",
        message: "Too many requests.",
      });
    },
  });
}
