const nodemailer = require("nodemailer");
const logger = require("../../../utils/logger");

class SendGridProvider {
  constructor() {
    this.transporter = null;
    if (process.env.SENDGRID_API_KEY) {
      this.initialize();
    }
  }

  initialize() {
    try {
      this.transporter = nodemailer.createTransport({
        host: "smtp.sendgrid.net",
        port: 587,
        secure: false,
        auth: {
          user: "apikey",
          pass: process.env.SENDGRID_API_KEY,
        },
      });

      logger.info("SendGrid provider initialized");
    } catch (error) {
      logger.error("Failed to initialize SendGrid provider:", error);
      throw error;
    }
  }

  async send({ to, subject, text, html, from, attachments = [] }) {
    if (!this.transporter) {
      throw new Error("SendGrid provider not initialized");
    }

    try {
      const mailOptions = {
        from: from || process.env.SENDGRID_FROM_EMAIL,
        to,
        subject,
        text,
        html,
        attachments,
      };

      const info = await this.transporter.sendMail(mailOptions);

      logger.info(`Email sent via SendGrid to ${to}: ${info.messageId}`);

      return {
        success: true,
        messageId: info.messageId,
        provider: "sendgrid",
      };
    } catch (error) {
      logger.error("SendGrid send error:", error);
      throw error;
    }
  }

  async verify() {
    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      logger.error("SendGrid verification failed:", error);
      return false;
    }
  }
}

module.exports = SendGridProvider;
