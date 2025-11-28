const otpService = require("../services/otp.service");
const emailService = require("../services/email/email.service");
const { KafkaProducerService } = require("../services/kafka.producer");
const logger = require("../utils/logger");

exports.requestOTP = async (req, res) => {
  try {
    const { identifier, purpose, userName, useKafka = false } = req.body;

    if (!identifier || !purpose) {
      return res.status(400).json({
        success: false,
        message: "Identifier and purpose are required",
      });
    }

    if (useKafka) {
      await KafkaProducerService.publishOTPRequest({
        identifier,
        purpose,
        templateName: `otp_${purpose}`,
        metadata: { userName },
      });

      return res.status(202).json({
        success: true,
        message: "OTP request queued for processing",
      });
    }

    const otpData = await otpService.createOTP(identifier, purpose, { userName });

    await emailService.sendTemplatedEmail({
      to: identifier,
      templateName: `otp_${purpose}`,
      data: {
        otp: otpData.otp,
        userName: userName || identifier,
        expiryMinutes: otpData.expiryMinutes,
      },
    });

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      expiresAt: otpData.expiresAt,
    });
  } catch (error) {
    logger.error("Request OTP error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to send OTP",
    });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { identifier, otp, purpose } = req.body;

    if (!identifier || !otp || !purpose) {
      return res.status(400).json({
        success: false,
        message: "Identifier, OTP, and purpose are required",
      });
    }

    const result = await otpService.verifyOTP(identifier, otp, purpose);

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      verified: result.verified,
    });
  } catch (error) {
    logger.error("Verify OTP error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "OTP verification failed",
    });
  }
};
