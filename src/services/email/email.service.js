const Handlebars = require("handlebars");
const db = require("../../config/database");
const logger = require("../../utils/logger");
const GmailProvider = require("./providers/gmail.provider");
const SendGridProvider = require("./providers/sendgrid.provider");

class EmailService {
  constructor() {
    this.providers = new Map();
    this.defaultProvider = process.env.EMAIL_PROVIDER || "gmail";
    this.initializeProviders();
  }

  initializeProviders() {
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      this.providers.set("gmail", new GmailProvider());
    }
    if (process.env.SENDGRID_API_KEY) {
      this.providers.set("sendgrid", new SendGridProvider());
    }
    if (this.providers.size === 0) {
      logger.warn("No email providers configured");
    } else {
      logger.info(`Email providers: ${Array.from(this.providers.keys()).join(", ")}`);
    }
  }

  async getTemplate(templateName) {
    const template = await db("notification_templates")
      .where({ name: templateName, type: "email", is_active: true })
      .first();
    if (!template) {
      throw new Error(`Email template '${templateName}' not found`);
    }
    return template;
  }

  renderTemplate(templateString, data) {
    const template = Handlebars.compile(templateString);
    return template(data);
  }

  async sendTemplatedEmail({ to, templateName, data = {}, provider, from, attachments = [] }) {
    try {
      const template = await this.getTemplate(templateName);
      let defaultData = template.default_data || {};
      if (typeof defaultData === 'string') {
        defaultData = JSON.parse(defaultData || "{}");
      }
      const mergedData = { ...defaultData, ...data };
      const subject = this.renderTemplate(template.subject, mergedData);
      const text = this.renderTemplate(template.body, mergedData);
      const html = template.html_body ? this.renderTemplate(template.html_body, mergedData) : undefined;
      return await this.sendEmail({ to, subject, text, html, provider, from, attachments, templateId: template.id });
    } catch (error) {
      logger.error(`Error sending templated email to ${to}:`, error);
      throw error;
    }
  }

  async sendEmail({ to, subject, text, html, from, attachments = [], provider, templateId }) {
    const selectedProvider = provider || this.defaultProvider;
    const emailProvider = this.providers.get(selectedProvider);
    if (!emailProvider) {
      throw new Error(`Email provider '${selectedProvider}' not available`);
    }
    try {
      const [notification] = await db("notifications").insert({
        type: "email", recipient: to, template_id: templateId || "custom",
        subject, body: text, status: "pending", provider: selectedProvider,
      }).returning("*");
      const result = await emailProvider.send({ to, subject, text, html, from, attachments });
      await db("notifications").where({ id: notification.id }).update({
        status: "sent", sent_at: db.fn.now(), metadata: JSON.stringify(result),
      });
      logger.info(`Email sent to ${to} via ${selectedProvider}`);
      return { ...result, notificationId: notification.id };
    } catch (error) {
      if (templateId) {
        await db("notifications").where({ recipient: to, template_id: templateId, status: "pending" })
          .update({ status: "failed", failed_at: db.fn.now(), error_message: error.message });
      }
      logger.error(`Email send failed to ${to}:`, error);
      throw error;
    }
  }

  async healthCheck() {
    const results = {};
    for (const [name, provider] of this.providers) {
      results[name] = await provider.verify();
    }
    return results;
  }
}

module.exports = new EmailService();
