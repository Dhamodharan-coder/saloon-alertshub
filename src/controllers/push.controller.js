const pushService = require("../services/push/push.service");
const { KafkaProducerService } = require("../services/kafka.producer");
const logger = require("../utils/logger");

exports.sendPushNotification = async (req, res) => {
  try {
    const { userId, title, body, data, platform, useKafka = false } = req.body;

    if (!userId || !title || !body) {
      return res.status(400).json({
        success: false,
        message: "userId, title, and body are required",
      });
    }

    if (useKafka) {
      await KafkaProducerService.publishPushNotification({
        userId,
        title,
        body,
        data,
        platform,
      });

      return res.status(202).json({
        success: true,
        message: "Push notification queued",
      });
    }

    const result = await pushService.sendPushNotification({
      userId,
      title,
      body,
      data,
      platform,
    });

    res.status(200).json({
      success: true,
      message: "Push notification sent",
      results: result,
    });
  } catch (error) {
    logger.error("Send push notification error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to send push notification",
    });
  }
};

exports.registerDevice = async (req, res) => {
  try {
    const { userId, token, platform, deviceId, deviceModel, osVersion, appVersion } = req.body;

    if (!userId || !token || !platform) {
      return res.status(400).json({
        success: false,
        message: "userId, token, and platform are required",
      });
    }

    const deviceToken = await pushService.registerDeviceToken({
      userId,
      token,
      platform,
      deviceId,
      deviceModel,
      osVersion,
      appVersion,
    });

    res.status(200).json({
      success: true,
      message: "Device token registered",
      deviceToken,
    });
  } catch (error) {
    logger.error("Register device error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to register device token",
    });
  }
};

exports.unregisterDevice = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is required",
      });
    }

    await pushService.unregisterDeviceToken(token);

    res.status(200).json({
      success: true,
      message: "Device token unregistered",
    });
  } catch (error) {
    logger.error("Unregister device error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to unregister device token",
    });
  }
};
