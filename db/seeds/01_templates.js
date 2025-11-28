/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex("notification_templates").del();

  // Insert default templates
  await knex("notification_templates").insert([
    {
      name: "otp_login",
      type: "email",
      subject: "Your OTP for Login - {{appName}}",
      body: "Your OTP for login is: {{otp}}. This code will expire in {{expiryMinutes}} minutes.",
      html_body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Login OTP</h2>
          <p>Hi {{userName}},</p>
          <p>Your OTP for login is:</p>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            {{otp}}
          </div>
          <p style="color: #666;">This code will expire in {{expiryMinutes}} minutes.</p>
          <p style="color: #999; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
        </div>
      `,
      default_data: JSON.stringify({
        appName: "Saloon AlertsHub",
        expiryMinutes: 5,
      }),
      is_active: true,
      description: "OTP template for user login",
    },
    {
      name: "otp_verification",
      type: "email",
      subject: "Verify Your Email - {{appName}}",
      body: "Your verification code is: {{otp}}. This code will expire in {{expiryMinutes}} minutes.",
      html_body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Email Verification</h2>
          <p>Hi {{userName}},</p>
          <p>Your verification code is:</p>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            {{otp}}
          </div>
          <p style="color: #666;">This code will expire in {{expiryMinutes}} minutes.</p>
        </div>
      `,
      default_data: JSON.stringify({
        appName: "Saloon AlertsHub",
        expiryMinutes: 5,
      }),
      is_active: true,
      description: "OTP template for email verification",
    },
    {
      name: "password_reset",
      type: "email",
      subject: "Reset Your Password - {{appName}}",
      body: "Your password reset code is: {{otp}}. This code will expire in {{expiryMinutes}} minutes.",
      html_body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset</h2>
          <p>Hi {{userName}},</p>
          <p>You requested to reset your password. Use this code:</p>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            {{otp}}
          </div>
          <p style="color: #666;">This code will expire in {{expiryMinutes}} minutes.</p>
          <p style="color: #999; font-size: 12px;">If you didn't request a password reset, please ignore this email.</p>
        </div>
      `,
      default_data: JSON.stringify({
        appName: "Saloon AlertsHub",
        expiryMinutes: 5,
      }),
      is_active: true,
      description: "OTP template for password reset",
    },
    {
      name: "booking_confirmation",
      type: "email",
      subject: "Booking Confirmation - {{appName}}",
      body: "Your booking for {{serviceName}} on {{bookingDate}} has been confirmed.",
      html_body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Booking Confirmed</h2>
          <p>Hi {{userName}},</p>
          <p>Your booking has been confirmed!</p>
          <div style="background: #f5f5f5; padding: 20px; margin: 20px 0;">
            <p><strong>Service:</strong> {{serviceName}}</p>
            <p><strong>Date:</strong> {{bookingDate}}</p>
            <p><strong>Time:</strong> {{bookingTime}}</p>
            <p><strong>Location:</strong> {{location}}</p>
          </div>
          <p>See you soon!</p>
        </div>
      `,
      default_data: JSON.stringify({
        appName: "Saloon AlertsHub",
      }),
      is_active: true,
      description: "Booking confirmation notification",
    },
    {
      name: "push_notification",
      type: "push",
      subject: "{{title}}",
      body: "{{message}}",
      default_data: JSON.stringify({}),
      is_active: true,
      description: "Generic push notification template",
    },
  ]);
};
