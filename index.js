import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import publicUserRoutes from "./routes/UserRoutes/publicUserRoutes.js";
import protectedUserRoutes from "./routes/UserRoutes/protectedUserRoutes.js";
import protectedSystemRoutes from "./routes/SystemRoutes/ProtectedSystemRoutes.js";
import publicTrainerRoutes from "./routes/TrainerRoutes/publicTrainerRoutes.js";
import privateTrainerRoutes from "./routes/TrainerRoutes/privateTrainerRoutes.js";
import publicAuthRoutes from "./routes/AuthRoutes/publicAuthRoutes.js";
import { requireAuth } from "./auth.js";
import { requestLogger } from "./logger.js";

dotenv.config();

const routeMap = new Map();

const COLORS = {
  reset: "\x1b[0m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  gray: "\x1b[90m",
  white: "\x1b[37m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
};

const BOX_COLOR = COLORS.cyan;
const TEXT_COLOR = COLORS.white;
const MUTED_COLOR = COLORS.gray;
const TITLE_COLOR = COLORS.green;
const METHOD_COLOR = COLORS.magenta;

const BOX_WIDTH = 80;

function stripAnsi(str) {
  return str.replace(/\x1b\[[0-9;]*m/g, "");
}

function stripWide(str) {
  return stripAnsi(str).replace(/[^\x00-\x7F]/g, "");
}

function line(text = "") {
  const visible = stripWide(text);
  const padded = visible.padEnd(BOX_WIDTH - 2, " ");
  return (
    BOX_COLOR +
    "║" +
    TEXT_COLOR +
    " " +
    padded +
    " " +
    BOX_COLOR +
    "║" +
    COLORS.reset
  );
}

function box(lines = []) {
  console.log(BOX_COLOR + "╔" + "═".repeat(BOX_WIDTH) + "╗" + COLORS.reset);
  console.log(line());
  lines.forEach((l) => console.log(line(l)));
  console.log(line());
  console.log(BOX_COLOR + "╚" + "═".repeat(BOX_WIDTH) + "╝" + COLORS.reset);
}

function extractRoutes(router, prefix = "", isProtected = false) {
  const routes = [];

  router.stack?.forEach((middleware) => {
    if (middleware.route) {
      const methods = Object.keys(middleware.route.methods);
      methods.forEach((method) => {
        routes.push({
          method: method.toUpperCase(),
          path:
            prefix +
            (middleware.route.path === "/" ? "" : middleware.route.path),
          protected: isProtected,
        });
      });
    } else if (middleware.name === "router" && middleware.regexp) {
      const nestedPrefix = extractPrefixFromRegex(middleware.regexp);
      const nestedRoutes = extractRoutes(
        middleware.handle,
        prefix + nestedPrefix,
        isProtected,
      );
      routes.push(...nestedRoutes);
    }
  });

  return routes;
}

function extractPrefixFromRegex(regexp) {
  const match = regexp.source.match(/^\\\/(\w+)/);
  return match ? "/" + match[1] : "";
}

const app = express();
const PORT = process.env.PORT || 3000;

app.set("trust proxy", true);

const allowedOrigins = [
  "http://localhost:5173",
  "https://dashboard.properform.app",
  "https://properform.app",
  "https://www.properform.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200,
  }),
);

app.use(express.json());

app.use(requestLogger);

// Public routes
app.use("/users", publicUserRoutes);
app.use("/trainers", publicTrainerRoutes);
app.use("/auth", publicAuthRoutes);

// Protected routes
app.use("/users", protectedUserRoutes);
app.use("/system", protectedSystemRoutes);
app.use("/trainers", privateTrainerRoutes);

app.get("/", (req, res) => {
  res.json({
    status: "API online",
    timestamp: new Date().toISOString(),
  });
});

app.use((req, res) => {
  const methods = routeMap.get(req.path);

  if (methods) {
    return res.status(405).json({
      error: "Method not allowed",
      message: `Diese Route existiert, aber nicht mit ${req.method}`,
      allowedMethods: Array.from(methods),
      hint: `Vielleicht meintest du ${Array.from(methods).join(" oder ")}`,
    });
  }

  res.status(404).json({
    error: "Route not found",
    message: `No API Route matches ${req.method} ${req.originalUrl}`,
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.clear();

  box([
    `${TITLE_COLOR}ProPerform API${TEXT_COLOR}`,
    "",
    `Version:      1.0.0`,
    `Environment:  ${process.env.NODE_ENV || "development"}`,
  ]);

  console.log(`\n${MUTED_COLOR}⏳ Loading modules...${COLORS.reset}`);
  console.log(`${COLORS.green}✔ Express loaded${COLORS.reset}`);
  console.log(`${COLORS.green}✔ CORS configured${COLORS.reset}`);
  console.log(`${COLORS.green}✔ Database configured${COLORS.reset}`);
  console.log(
    `${COLORS.green}✔ Authentication middleware loaded${COLORS.reset}`,
  );
  console.log(`${COLORS.green}✔ Routes mounted${COLORS.reset}\n`);

  console.log(`${COLORS.yellow}✨ Server started ✨${COLORS.reset}\n`);

  box([
    `${TITLE_COLOR}ProPerform API is ONLINE${TEXT_COLOR}`,
    "",
    `Local:   http://localhost:${PORT}`,
    `Network: http://0.0.0.0:${PORT}`,
    `Started: ${new Date().toLocaleString("de-AT")}`,
    "",
    "Ready to handle requests",
  ]);

  console.log(`\n${COLORS.blue}📋 REGISTERED ROUTES:${COLORS.reset}\n`);

  const allRoutes = [];

  allRoutes.push(...extractRoutes(publicUserRoutes, "/users", false));
  allRoutes.push(...extractRoutes(publicTrainerRoutes, "/trainers", false));
  allRoutes.push(...extractRoutes(publicAuthRoutes, "/auth", false));
  allRoutes.push(...extractRoutes(protectedUserRoutes, "/users", true));
  allRoutes.push(...extractRoutes(protectedSystemRoutes, "/system", true));
  allRoutes.push(...extractRoutes(privateTrainerRoutes, "/trainers", true));

  allRoutes.sort((a, b) => {
    if (a.path !== b.path) return a.path.localeCompare(b.path);
    return a.method.localeCompare(b.method);
  });

  const uniqueRoutes = [];
  const seen = new Set();
  allRoutes.forEach((route) => {
    const key = `${route.method}:${route.path}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueRoutes.push(route);
    }
  });

  const publicRoutes = uniqueRoutes.filter((r) => !r.protected);
  const protectedRoutes = uniqueRoutes.filter((r) => r.protected);

  uniqueRoutes.forEach(({ method, path }) => {
    if (!routeMap.has(path)) {
      routeMap.set(path, new Set());
    }
    routeMap.get(path).add(method);
  });

  if (publicRoutes.length > 0) {
    console.log(`${COLORS.green}🔓 PUBLIC ROUTES:${COLORS.reset}`);
    publicRoutes.forEach((route) => {
      const methodFormatted = route.method.padEnd(6);
      console.log(
        `  ${METHOD_COLOR}${methodFormatted}${COLORS.reset} ${route.path}`,
      );
    });
    console.log();
  }

  if (protectedRoutes.length > 0) {
    console.log(
      `${COLORS.magenta}🔐 PROTECTED ROUTES (require auth):${COLORS.reset}`,
    );
    protectedRoutes.forEach((route) => {
      const methodFormatted = route.method.padEnd(6);
      console.log(
        `  ${METHOD_COLOR}${methodFormatted}${COLORS.reset} ${route.path}`,
      );
    });
    console.log();
  }

  console.log(
    `${MUTED_COLOR}Total: ${uniqueRoutes.length} routes registered${COLORS.reset}\n`,
  );
});
