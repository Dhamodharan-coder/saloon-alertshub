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
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Email Verification</title>
    <style type="text/css">
        /* Change background to soft gray */
        body { margin: 0; padding: 0; min-width: 100%; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased; background-color: #f5f5f5; }
        table { border-spacing: 0; border-collapse: collapse; }
        td { padding: 0; }
        img { border: 0; }
        /* Change wrapper background to soft gray */
        .wrapper { width: 100%; table-layout: fixed; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; background-color: #f5f5f5; }
        .webkit { max-width: 600px; margin: 0 auto; }
        
        /* Mobile styles: Adjust for 6 digits */
        @media screen and (max-width: 600px) {
            .otp-box-cell { padding: 0 4px !important; }
            .otp-digit { width: 40px !important; height: 40px !important; font-size: 22px !important; line-height: 40px !important; }
        }
    </style>
</head>
<body style="background-color: #f5f5f5; margin: 0; padding: 0;">

    <div class="wrapper" style="background-color: #f5f5f5;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr>
                <td align="center" style="padding: 40px 20px;">
                    <!-- Main Card -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 16px; width: 100%; max-width: 500px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        
                        <!-- Icon Section -->
                        <tr>
                            <td align="center" style="padding-top: 50px; padding-bottom: 20px;">
                                <!-- Icon background medium gray -->
                                <div style="display: inline-block; width: 80px; height: 80px; background-color: #cccccc; border-radius: 50%; text-align: center; line-height: 80px;">
                                    <!-- Envelope Unicode Icon (Icon color remains white) -->
                                    <span style="font-size: 40px; color: #ffffff;">&#9993;</span>
                                </div>
                            </td>
                        </tr>

                        <!-- Title Section -->
                        <tr>
                            <td align="center" style="padding: 0 40px;">
                                <h1 style="margin: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 20px; font-weight: bold; color: #333333;">
                                    Here is your One Time Password
                                </h1>
                                <p style="margin: 10px 0 0 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; color: #999999;">
                                    to validate your email address
                                </p>
                            </td>
                        </tr>

                        <!-- OTP Digits Section - Updated for 6 Digits -->
                        <tr>
                            <td align="center" style="padding: 40px 20px;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                    <tr>
                                        <!-- Digit 1 -->
                                        <td class="otp-box-cell" style="padding: 0 5px;">
                                            <div class="otp-digit" style="width: 50px; height: 50px; background-color: #ffffff; border: 1px solid #eeeeee; border-radius: 8px; text-align: center; line-height: 50px; font-family: Arial, sans-serif; font-size: 28px; font-weight: bold; color: #333333;">
                                                {{d1}}
                                            </div>
                                        </td>
                                        <!-- Digit 2 -->
                                        <td class="otp-box-cell" style="padding: 0 5px;">
                                            <div class="otp-digit" style="width: 50px; height: 50px; background-color: #ffffff; border: 1px solid #eeeeee; border-radius: 8px; text-align: center; line-height: 50px; font-family: Arial, sans-serif; font-size: 28px; font-weight: bold; color: #333333;">
                                                {{d2}}
                                            </div>
                                        </td>
                                        <!-- Digit 3 -->
                                        <td class="otp-box-cell" style="padding: 0 5px;">
                                            <div class="otp-digit" style="width: 50px; height: 50px; background-color: #ffffff; border: 1px solid #eeeeee; border-radius: 8px; text-align: center; line-height: 50px; font-family: Arial, sans-serif; font-size: 28px; font-weight: bold; color: #333333;">
                                                {{d3}}
                                            </div>
                                        </td>
                                        <!-- Digit 4 -->
                                        <td class="otp-box-cell" style="padding: 0 5px;">
                                            <div class="otp-digit" style="width: 50px; height: 50px; background-color: #ffffff; border: 1px solid #eeeeee; border-radius: 8px; text-align: center; line-height: 50px; font-family: Arial, sans-serif; font-size: 28px; font-weight: bold; color: #333333;">
                                                {{d4}}
                                            </div>
                                        </td>
                                        <!-- Digit 5 -->
                                        <td class="otp-box-cell" style="padding: 0 5px;">
                                            <div class="otp-digit" style="width: 50px; height: 50px; background-color: #ffffff; border: 1px solid #eeeeee; border-radius: 8px; text-align: center; line-height: 50px; font-family: Arial, sans-serif; font-size: 28px; font-weight: bold; color: #333333;">
                                                {{d5}}
                                            </div>
                                        </td>
                                        <!-- Digit 6 -->
                                        <td class="otp-box-cell" style="padding: 0 5px;">
                                            <div class="otp-digit" style="width: 50px; height: 50px; background-color: #ffffff; border: 1px solid #eeeeee; border-radius: 8px; text-align: center; line-height: 50px; font-family: Arial, sans-serif; font-size: 28px; font-weight: bold; color: #333333;">
                                                {{d6}}
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <!-- Expiry Section -->
                        <tr>
                            <td align="center" style="padding-bottom: 50px;">
                                <p style="margin: 0; font-family: Arial, sans-serif; font-size: 14px; font-weight: bold; color: #333333;">
                                    OTP will expire in 5 minutes.
                                </p>
                            </td>
                        </tr>

                    </table>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
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
