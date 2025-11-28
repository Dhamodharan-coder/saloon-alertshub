const apn = require("apn");
const logger = require("../../../utils/logger");
const path = require("path");

class APNsProvider {
  constructor() {
    this.provider = null;
    if (process.env.APNS_KEY_PATH) {
      this.initialize();
    }
  }

  initialize() {
    try {
      const keyPath = path.resolve(process.env.APNS_KEY_PATH);
      const options = {
        token: {
          key: keyPath,
          keyId: process.env.APNS_KEY_ID,
          teamId: process.env.APNS_TEAM_ID,
        },
        production: process.env.APNS_PRODUCTION === "true",
      };

      this.provider = new apn.Provider(options);
      logger.info("APNs provider initialized");
    } catch (error) {
      logger.error("Failed to initialize APNs provider:", error);
    }
  }

  async send({ token, title, body, data = {}, badge, sound = "default" }) {
    if (!this.provider) {
      throw new Error("APNs provider not initialized");
    }

    try {
      const notification = new apn.Notification();
      notification.alert = { title, body };
      notification.sound = sound;
      notification.topic = process.env.APNS_BUNDLE_ID;
      notification.payload = data;

      if (badge !== undefined) {
        notification.badge = badge;
      }

      const result = await this.provider.send(notification, token);

      if (result.failed.length > 0) {
        const error = result.failed[0];
        logger.error("APNs send failed:", error);
        throw new Error(error.response.reason);
      }

      logger.info(`APNs notification sent to ${token}`);

      return {
        success: true,
        messageId: result.sent[0]?.device || token,
        provider: "apns",
      };
    } catch (error) {
      logger.error("APNs send error:", error);
      throw error;
    }
  }

  async shutdown() {
    if (this.provider) {
      this.provider.shutdown();
    }
  }
}

module.exports = APNsProvider;
