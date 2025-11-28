const { Kafka, logLevel } = require("kafkajs");
const logger = require("../utils/logger");

const brokers = (process.env.KAFKA_BROKERS || "localhost:9092").split(",");

const kafkaConfig = {
  clientId: process.env.KAFKA_CLIENT_ID || "saloon-alertshub",
  brokers,
  logLevel: logLevel.ERROR,
  retry: {
    initialRetryTime: 300,
    retries: 8,
  },
};

// Add SASL authentication if configured
if (process.env.KAFKA_SASL_MECHANISM) {
  kafkaConfig.sasl = {
    mechanism: process.env.KAFKA_SASL_MECHANISM,
    username: process.env.KAFKA_SASL_USERNAME,
    password: process.env.KAFKA_SASL_PASSWORD,
  };
}

// Add SSL if in production
if (process.env.NODE_ENV === "production") {
  kafkaConfig.ssl = true;
}

const kafka = new Kafka(kafkaConfig);

// Create producer
const producer = kafka.producer({
  allowAutoTopicCreation: true,
  transactionTimeout: 30000,
});

// Create consumer
const consumer = kafka.consumer({
  groupId: process.env.KAFKA_GROUP_ID || "notification-service",
  sessionTimeout: 30000,
  heartbeatInterval: 3000,
});

// Producer connection
let producerConnected = false;
const connectProducer = async () => {
  if (!producerConnected) {
    await producer.connect();
    producerConnected = true;
    logger.info("✅ Kafka producer connected successfully");
  }
};

// Consumer connection
let consumerConnected = false;
const connectConsumer = async () => {
  if (!consumerConnected) {
    await consumer.connect();
    consumerConnected = true;
    logger.info("✅ Kafka consumer connected successfully");
  }
};

// Graceful shutdown
const disconnectKafka = async () => {
  if (producerConnected) {
    await producer.disconnect();
    logger.info("Kafka producer disconnected");
  }
  if (consumerConnected) {
    await consumer.disconnect();
    logger.info("Kafka consumer disconnected");
  }
};

module.exports = {
  kafka,
  producer,
  consumer,
  connectProducer,
  connectConsumer,
  disconnectKafka,
};
