const emailService = require("../services/email/email.service");
const { KafkaProducerService } = require("../services/kafka.producer");
const logger = require("../utils/logger");

exports.sendEmail = async (req, res) => {
  try {
    const { to, subject, text, html, templateName, data, useKafka = false } = req.body;

    if (!to) {
      return res.status(400).json({
        success: false,
        message: "Recipient email is required",
      });
    }

    if (useKafka) {
      await KafkaProducerService.publishEmailNotification({
        to,
        subject,
        text,
        html,
        templateName,
        data,
      });

      return res.status(202).json({
        success: true,
        message: "Email queued for sending",
      });
    }

    let result;
    if (templateName) {
      result = await emailService.sendTemplatedEmail({
        to,
        templateName,
        data,
      });
    } else {
      if (!subject || (!text && !html)) {
        return res.status(400).json({
          success: false,
          message: "Subject and body are required for raw emails",
        });
      }
      result = await emailService.sendEmail({
        to,
        subject,
        text,
        html,
      });
    }

    res.status(200).json({
      success: true,
      message: "Email sent successfully",
      ...result,
    });
  } catch (error) {
    logger.error("Send email error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to send email",
    });
  }
};

exports.healthCheck = async (req, res) => {
  try {
    const health = await emailService.healthCheck();
    res.status(200).json({
      success: true,
      providers: health,
    });
  } catch (error) {
    logger.error("Email health check error:", error);
    res.status(500).json({
      success: false,
      message: "Health check failed",
    });
  }
};
