const nodemailer = require("nodemailer");
const logger = require("../../../utils/logger");

class GmailProvider {
  constructor() {
    this.transporter = null;
    this.initialize();
  }

  initialize() {
    try {
      this.transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
      });

      logger.info("Gmail provider initialized");
    } catch (error) {
      logger.error("Failed to initialize Gmail provider:", error);
      throw error;
    }
  }

  async send({ to, subject, text, html, from, attachments = [] }) {
    try {
      const mailOptions = {
        from: from || process.env.GMAIL_USER,
        to,
        subject,
        text,
        html,
        attachments,
      };

      const info = await this.transporter.sendMail(mailOptions);

      logger.info(`Email sent via Gmail to ${to}: ${info.messageId}`);

      return {
        success: true,
        messageId: info.messageId,
        provider: "gmail",
      };
    } catch (error) {
      logger.error("Gmail send error:", error);
      throw error;
    }
  }

  async verify() {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      logger.error("Gmail verification failed:", error);
      return false;
    }
  }
}

module.exports = GmailProvider;
