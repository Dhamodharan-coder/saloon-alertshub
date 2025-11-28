const db = require("../../config/database");
const logger = require("../../utils/logger");
const FCMProvider = require("./providers/fcm.provider");
const APNsProvider = require("./providers/apns.provider");

class PushService {
  constructor() {
    this.providers = new Map();
    this.initializeProviders();
  }

  initializeProviders() {
    if (process.env.FCM_SERVICE_ACCOUNT_PATH) {
      this.providers.set("fcm", new FCMProvider());
      this.providers.set("android", new FCMProvider());
      this.providers.set("web", new FCMProvider());
    }
    if (process.env.APNS_KEY_PATH) {
      this.providers.set("apns", new APNsProvider());
      this.providers.set("ios", new APNsProvider());
    }
    logger.info(`Push providers: ${Array.from(this.providers.keys()).join(", ")}`);
  }

  async sendPushNotification({ userId, title, body, data = {}, platform }) {
    try {
      const tokens = await this.getDeviceTokens(userId, platform);
      if (tokens.length === 0) {
        throw new Error(`No device tokens found for user ${userId}`);
      }

      const results = [];
      for (const tokenData of tokens) {
        try {
          const provider = this.providers.get(tokenData.platform);
          if (!provider) {
            logger.warn(`No provider for platform ${tokenData.platform}`);
            continue;
          }

          const [notification] = await db("notifications").insert({
            type: "push",
            recipient: userId,
            template_id: "push_notification",
            subject: title,
            body,
            status: "pending",
            provider: tokenData.platform,
            metadata: JSON.stringify({ deviceId: tokenData.device_id }),
          }).returning("*");

          const result = await provider.send({
            token: tokenData.token,
            title,
            body,
            data,
          });

          await db("notifications").where({ id: notification.id }).update({
            status: "sent",
            sent_at: db.fn.now(),
          });

          await db("device_tokens").where({ id: tokenData.id }).update({
            last_used_at: db.fn.now(),
          });

          results.push({ success: true, ...result });
        } catch (error) {
          logger.error(`Failed to send to token ${tokenData.id}:`, error);
          results.push({ success: false, error: error.message });
        }
      }

      return results;
    } catch (error) {
      logger.error("Push notification error:", error);
      throw error;
    }
  }

  async getDeviceTokens(userId, platform = null) {
    const query = db("device_tokens")
      .where({ user_id: userId, is_active: true });

    if (platform) {
      query.where({ platform });
    }

    return await query.select("*");
  }

  async registerDeviceToken(tokenData) {
    const { userId, token, platform, deviceId, deviceModel, osVersion, appVersion } = tokenData;

    const existing = await db("device_tokens").where({ token }).first();

    if (existing) {
      await db("device_tokens").where({ id: existing.id }).update({
        user_id: userId,
        is_active: true,
        last_used_at: db.fn.now(),
        updated_at: db.fn.now(),
      });
      return existing;
    }

    const [newToken] = await db("device_tokens").insert({
      user_id: userId,
      token,
      platform,
      device_id: deviceId,
      device_model: deviceModel,
      os_version: osVersion,
      app_version: appVersion,
      is_active: true,
      last_used_at: db.fn.now(),
    }).returning("*");

    logger.info(`Device token registered for user ${userId}`);
    return newToken;
  }

  async unregisterDeviceToken(token) {
    await db("device_tokens").where({ token }).update({
      is_active: false,
      updated_at: db.fn.now(),
    });
    logger.info(`Device token unregistered: ${token}`);
  }
}

module.exports = new PushService();
