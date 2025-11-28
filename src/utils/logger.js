const winston = require("winston");

const logLevel = process.env.LOG_LEVEL || "info";
const nodeEnv = process.env.NODE_ENV || "development";

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

const transports = [
  new winston.transports.Console({
    format: nodeEnv === "production" ? logFormat : consoleFormat,
  }),
];

// Add file transport in production
if (nodeEnv === "production") {
  transports.push(
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      format: logFormat,
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
      format: logFormat,
    })
  );
}

const logger = winston.createLogger({
  level: logLevel,
  format: logFormat,
  transports,
  exitOnError: false,
});

module.exports = logger;
