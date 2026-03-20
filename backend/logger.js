import fs from "fs";
import path from "path";

const env = process.env.NODE_ENV || "development";
const isDev = env !== "production";
const LOG_LEVEL = process.env.LOG_LEVEL || (isDev ? "debug" : "info");

const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };

const LEVEL_COLORS = {
  debug: "\x1b[36m",
  info: "\x1b[32m",
  warn: "\x1b[33m",
  error: "\x1b[31m",
};
const RESET = "\x1b[0m";
const DIM = "\x1b[2m";
const BOLD = "\x1b[1m";

const logsDir = path.join(process.cwd(), "logs");

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Returns the current date as a YYYY-MM-DD string for daily log rotation.
 *
 * @returns {string} Today's date, e.g. "2026-02-23"
 */
function getDateStamp() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Resolves the daily rotating log file path based on the current date and environment.
 *
 * @returns {string} Absolute path to today's log file, e.g. "/logs/2026-02-23.dev.log"
 */
function getLogFile() {
  return path.join(logsDir, `${getDateStamp()}.${env}.log`);
}

/**
 * Checks whether the given log level should be logged
 * based on the configured LOG_LEVEL threshold.
 *
 * @param {"debug"|"info"|"warn"|"error"} level - The level to check
 * @returns {boolean} True if the level meets or exceeds the threshold
 */
function shouldLog(level) {
  return LEVELS[level] >= (LEVELS[LOG_LEVEL] ?? 1);
}

/**
 * Formats a request log line in the pipe-separated format.
 *
 * @param {string} method - HTTP method, e.g. "POST"
 * @param {string} url - Request URL, e.g. "/auth/login"
 * @param {number} status - HTTP status code
 * @param {number} duration - Request duration in milliseconds
 * @param {string} ip - Client IP address
 * @returns {string} Formatted log line, e.g. "TIMESTAMP: ... | METHOD: POST | ..."
 */
function formatFileLine(method, url, status, duration, ip) {
  return [
    `TIMESTAMP: ${new Date().toISOString()}`,
    `METHOD: ${method}`,
    `URL: ${url}`,
    `STATUS: ${status}`,
    `DURATION: ${duration}ms`,
    `IP: ${ip}`,
  ].join(" | ");
}

/**
 * Formats an error log line in the pipe-separated format including error details and stack trace.
 *
 * @param {string} message - Human-readable error description
 * @param {string} errorName - Name of the error, e.g. "TypeError"
 * @param {string} errorMessage - Error message
 * @param {string} stack - Full stack trace
 * @returns {string} Formatted error log line
 */
function formatErrorLine(message, errorName, errorMessage, stack) {
  return [
    `TIMESTAMP: ${new Date().toISOString()}`,
    `LEVEL: ERROR`,
    `MESSAGE: ${message}`,
    `ERROR: ${errorName}: ${errorMessage}`,
    `STACK: ${stack?.split("\n").join(" → ")}`,
  ].join(" | ");
}

/**
 * Formats a generic log line for non-request, non-error entries.
 *
 * @param {"debug"|"info"|"warn"|"error"} level - Log level
 * @param {string} message - Log message
 * @param {Record<string, unknown>} [meta={}] - Additional metadata key-value pairs
 * @returns {string} Formatted log line
 */
function formatGenericLine(level, message, meta = {}) {
  const base = [
    `TIMESTAMP: ${new Date().toISOString()}`,
    `LEVEL: ${level.toUpperCase()}`,
    `MESSAGE: ${message}`,
  ];

  const extras = Object.entries(meta).map(
    ([k, v]) => `${k.toUpperCase()}: ${v}`,
  );

  return [...base, ...extras].join(" | ");
}

/**
 * Appends a line to today's rotating log file.
 *
 * @param {string} line - The formatted log line to write
 * @returns {void}
 */
function writeToFile(line) {
  fs.appendFile(getLogFile(), line + "\n", (err) => {
    if (err) console.error("[logger] failed to write log.", err.message);
  });
}

/**
 * Formats a log entry for colorized console output.
 *
 * @param {"debug"|"info"|"warn"|"error"} level - Log level
 * @param {string} message - Log message
 * @param {Record<string, unknown>} [meta={}] - Additional metadata
 * @returns {string} Formatted string with ANSI color codes
 */
function formatConsole(level, message, meta = {}) {
  const color = LEVEL_COLORS[level] ?? "";
  const ts = DIM + new Date().toISOString() + RESET;
  const badge = `${color}${BOLD}[${level.toUpperCase()}]${RESET}`;
  const msg = `${BOLD}${message}${RESET}`;

  const extras = Object.entries(meta)
    .filter(([k]) => k !== "stack")
    .map(([k, v]) => `${DIM}${k}=${RESET}${v}`)
    .join(`  `);

  let out = `${ts}  ${badge}  ${msg}`;
  if (extras) out += `  ${extras}`;
  if (meta.stack) out += `\n${DIM}${meta.stack}${RESET}`;

  return out;
}

/**
 * Core log function — writes to console and appends to the daily rotating log file.
 *
 * @param {"debug"|"info"|"warn"|"error"} level - Log level
 * @param {string} message - Log message
 * @param {Record<string, unknown>} [meta={}] - Additional metadata
 * @returns {void}
 */
function log(level, message, meta = {}) {
  if (!shouldLog(level)) return;

  const consoleFn =
    level === "error"
      ? "error"
      : level === "warn"
        ? "warn"
        : level === "debug"
          ? "debug"
          : "log";

  console[consoleFn](formatConsole(level, message, meta));
  writeToFile(formatGenericLine(level, message, meta));
}

/**
 * Public logger with methods for each log level.
 * Errors accept either a plain meta object or a native Error instance.
 * Error entries include the full stack trace in the log file.
 *
 * @example
 * logger.info("Server started", { port: 3000 });
 * logger.warn("Rate limit hit", { ip: "1.2.3.4" });
 * logger.error("DB connection failed", new Error("timeout"));
 */
export const logger = {
  debug: (msg, meta) => log("debug", msg, meta),
  info: (msg, meta) => log("info", msg, meta),
  warn: (msg, meta) => log("warn", msg, meta),
  error: (msg, errOrMeta) => {
    if (!shouldLog("error")) return;

    if (errOrMeta instanceof Error) {
      const line = formatErrorLine(
        msg,
        errOrMeta.name,
        errOrMeta.message,
        errOrMeta.stack,
      );
      console.error(
        formatConsole("error", msg, {
          errorName: errOrMeta.name,
          errorMessage: errOrMeta.message,
          stack: errOrMeta.stack,
        }),
      );
      writeToFile(line);
    } else {
      log("error", msg, errOrMeta);
    }
  },
};

/**
 * Express middleware that logs every finished HTTP request in the pipe-separated format.
 * Log level is automatically derived from the HTTP status code:
 * 5xx → error, 4xx → warn, everything else → info.
 *
 * @param {import("express").Request}      req  - Express request object
 * @param {import("express").Response}     res  - Express response object
 * @param {import("express").NextFunction} next - Express next function
 * @returns {void}
 */
export function requestLogger(req, res, next) {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const ip = req.headers["x-forwarded-for"]?.split(",")[0].trim() ?? req.ip;
    const status = res.statusCode;
    const method = req.method;
    const url = req.originalUrl;

    const level = status >= 500 ? "error" : status >= 400 ? "warn" : "info";

    const consoleFn =
      level === "error" ? "error" : level === "warn" ? "warn" : "log";
    console[consoleFn](
      formatConsole(level, `HTTP ${method} ${url} ${status}`, {
        duration: `${duration}ms`,
        ip,
      }),
    );

    writeToFile(formatFileLine(method, url, status, duration, ip));
  });

  next();
}

process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception — process will exit", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.error(
    "Unhandled Promise Rejection",
    reason instanceof Error ? reason : new Error(String(reason)),
  );
});
