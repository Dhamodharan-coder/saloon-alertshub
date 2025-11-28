const { producer, connectProducer } = require("../config/kafka");
const logger = require("../utils/logger");

const TOPICS = {
  EMAIL_NOTIFICATIONS: "email-notifications",
  PUSH_NOTIFICATIONS: "push-notifications",
  OTP_REQUESTS: "otp-requests",
};

class KafkaProducerService {
  async init() {
    await connectProducer();
  }

  async publishEmailNotification(emailData) {
    try {
      await producer.send({
        topic: TOPICS.EMAIL_NOTIFICATIONS,
        messages: [{
          key: emailData.recipient,
          value: JSON.stringify(emailData),
          headers: {
            "content-type": "application/json",
            timestamp: new Date().toISOString(),
          },
        }],
      });
      logger.info(`Email notification published to Kafka: ${emailData.recipient}`);
    } catch (error) {
      logger.error("Error publishing email notification:", error);
      throw error;
    }
  }

  async publishPushNotification(pushData) {
    try {
      await producer.send({
        topic: TOPICS.PUSH_NOTIFICATIONS,
        messages: [{
          key: pushData.userId,
          value: JSON.stringify(pushData),
          headers: {
            "content-type": "application/json",
            timestamp: new Date().toISOString(),
          },
        }],
      });
      logger.info(`Push notification published to Kafka: ${pushData.userId}`);
    } catch (error) {
      logger.error("Error publishing push notification:", error);
      throw error;
    }
  }

  async publishOTPRequest(otpData) {
    try {
      await producer.send({
        topic: TOPICS.OTP_REQUESTS,
        messages: [{
          key: otpData.identifier,
          value: JSON.stringify(otpData),
          headers: {
            "content-type": "application/json",
            timestamp: new Date().toISOString(),
          },
        }],
      });
      logger.info(`OTP request published to Kafka: ${otpData.identifier}`);
    } catch (error) {
      logger.error("Error publishing OTP request:", error);
      throw error;
    }
  }
}

module.exports = { KafkaProducerService: new KafkaProducerService(), TOPICS };
