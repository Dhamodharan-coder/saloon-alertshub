const admin = require("firebase-admin");
const logger = require("../../../utils/logger");
const path = require("path");

class FCMProvider {
  constructor() {
    this.app = null;
    if (process.env.FCM_SERVICE_ACCOUNT_PATH) {
      this.initialize();
    }
  }

  initialize() {
    try {
      const serviceAccountPath = path.resolve(process.env.FCM_SERVICE_ACCOUNT_PATH);
      const serviceAccount = require(serviceAccountPath);

      this.app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      logger.info("FCM provider initialized");
    } catch (error) {
      logger.error("Failed to initialize FCM provider:", error);
    }
  }

  async send({ token, title, body, data = {}, imageUrl }) {
    if (!this.app) {
      throw new Error("FCM provider not initialized");
    }

    try {
      const message = {
        notification: { title, body },
        data,
        token,
      };

      if (imageUrl) {
        message.notification.imageUrl = imageUrl;
      }

      const response = await admin.messaging().send(message);
      logger.info(`FCM notification sent: ${response}`);

      return { success: true, messageId: response, provider: "fcm" };
    } catch (error) {
      logger.error("FCM send error:", error);
      throw error;
    }
  }

  async sendMulticast({ tokens, title, body, data = {}, imageUrl }) {
    if (!this.app) {
      throw new Error("FCM provider not initialized");
    }

    try {
      const message = {
        notification: { title, body },
        data,
        tokens,
      };

      if (imageUrl) {
        message.notification.imageUrl = imageUrl;
      }

      const response = await admin.messaging().sendEachForMulticast(message);
      logger.info(`FCM multicast sent: ${response.successCount}/${tokens.length} successful`);

      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
        responses: response.responses,
        provider: "fcm",
      };
    } catch (error) {
      logger.error("FCM multicast error:", error);
      throw error;
    }
  }
}

module.exports = FCMProvider;
