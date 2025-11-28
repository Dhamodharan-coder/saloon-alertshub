require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const routes = require("./routes");
const logger = require("./utils/logger");
const kafkaConsumerService = require("./services/kafka.consumer");
const { KafkaProducerService } = require("./services/kafka.producer");
const { disconnectKafka } = require("./config/kafka");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(",") || "*" }));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// API Routes
app.use("/api/v1", routes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// Initialize Kafka
async function initializeKafka() {
  try {
    await KafkaProducerService.init();
    await kafkaConsumerService.init();
    logger.info("✅ Kafka initialized successfully");
  } catch (error) {
    logger.error("❌ Failed to initialize Kafka:", error);
    // Don't exit - service can still work without Kafka
  }
}

// Start server
async function startServer() {
  try {
    // Initialize Kafka
    await initializeKafka();

    // Start Express server
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📧 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, shutting down gracefully");
  await disconnectKafka();
  process.exit(0);
});

process.on("SIGINT", async () => {
  logger.info("SIGINT received, shutting down gracefully");
  await disconnectKafka();
  process.exit(0);
});

// Start the application
startServer();

module.exports = app;
