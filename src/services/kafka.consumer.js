const { consumer, connectConsumer } = require("../config/kafka");
const emailService = require("./email/email.service");
const pushService = require("./push/push.service");
const otpService = require("./otp.service");
const logger = require("../utils/logger");
const { TOPICS } = require("./kafka.producer");

class KafkaConsumerService {
  async init() {
    await connectConsumer();
    await this.subscribeToTopics();
    await this.startConsuming();
  }

  async subscribeToTopics() {
    await consumer.subscribe({ topics: Object.values(TOPICS), fromBeginning: false });
    logger.info("Subscribed to Kafka topics");
  }

  async startConsuming() {
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const value = JSON.parse(message.value.toString());
          logger.info(`Processing message from topic ${topic}`);

          switch (topic) {
            case TOPICS.EMAIL_NOTIFICATIONS:
              await this.handleEmailNotification(value);
              break;
            case TOPICS.PUSH_NOTIFICATIONS:
              await this.handlePushNotification(value);
              break;
            case TOPICS.OTP_REQUESTS:
              await this.handleOTPRequest(value);
              break;
            default:
              logger.warn(`Unknown topic: ${topic}`);
          }
        } catch (error) {
          logger.error(`Error processing message from ${topic}:`, error);
        }
      },
    });
    logger.info("Kafka consumer started");
  }

  async handleEmailNotification(data) {
    try {
      if (data.templateName) {
        await emailService.sendTemplatedEmail(data);
      } else {
        await emailService.sendEmail(data);
      }
    } catch (error) {
      logger.error("Error handling email notification:", error);
      throw error;
    }
  }

  async handlePushNotification(data) {
    try {
      await pushService.sendPushNotification(data);
    } catch (error) {
      logger.error("Error handling push notification:", error);
      throw error;
    }
  }

  async handleOTPRequest(data) {
    try {
      const { identifier, purpose, templateName, metadata } = data;
      const otpData = await otpService.createOTP(identifier, purpose, metadata);

      await emailService.sendTemplatedEmail({
        to: identifier,
        templateName: templateName || "otp_login",
        data: {
          otp: otpData.otp,
          userName: metadata?.userName || identifier,
          expiryMinutes: otpData.expiryMinutes,
        },
      });

      logger.info(`OTP sent to ${identifier} for ${purpose}`);
    } catch (error) {
      logger.error("Error handling OTP request:", error);
      throw error;
    }
  }
}

module.exports = new KafkaConsumerService();
