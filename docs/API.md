# API Reference

## Base URL

```
http://localhost:3000/api/v1
```

## Authentication

Currently, the API does not require authentication. In production, implement API key authentication using the `X-API-Key` header.

---

## OTP Endpoints

### Request OTP

Generate and send an OTP to the specified identifier (email/phone).

**Endpoint:** `POST /otp/request`

**Request Body:**

```json
{
  "identifier": "user@example.com",
  "purpose": "login|verification|reset_password",
  "userName": "John Doe",
  "useKafka": false
}
```

**Parameters:**
- `identifier` (required): Email or phone number
- `purpose` (required): OTP purpose - `login`, `verification`, or `reset_password`
- `userName` (optional): User's name for personalization
- `useKafka` (optional): Process asynchronously via Kafka (default: false)

**Response (200):**

```json
{
  "success": true,
  "message": "OTP sent successfully",
  "expiresAt": "2023-11-28T18:46:50.000Z"
}
```

**Response (202) - When useKafka=true:**

```json
{
  "success": true,
  "message": "OTP request queued for processing"
}
```

---

### Verify OTP

Verify an OTP for the given identifier and purpose.

**Endpoint:** `POST /otp/verify`

**Request Body:**

```json
{
  "identifier": "user@example.com",
  "otp": "123456",
  "purpose": "login"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "OTP verified successfully",
  "verified": true
}
```

**Error Response (400):**

```json
{
  "success": false,
  "message": "Invalid OTP. 2 attempt(s) remaining."
}
```

---

## Email Endpoints

### Send Email

Send an email using a template or raw content.

**Endpoint:** `POST /email/send`

**Templated Email Request:**

```json
{
  "to": "recipient@example.com",
  "templateName": "booking_confirmation",
  "data": {
    "userName": "John Doe",
    "serviceName": "Haircut",
    "bookingDate": "2023-12-01",
    "bookingTime": "10:00 AM",
    "location": "Downtown Salon"
  },
  "useKafka": false
}
```

**Raw Email Request:**

```json
{
  "to": "recipient@example.com",
  "subject": "Welcome!",
  "text": "Plain text content",
  "html": "<h1>HTML content</h1>",
  "useKafka": false
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Email sent successfully",
  "messageId": "abc123@gmail.com",
  "provider": "gmail",
  "notificationId": "uuid"
}
```

---

### Email Health Check

Check the health of configured email providers.

**Endpoint:** `GET /email/health`

**Response (200):**

```json
{
  "success": true,
  "providers": {
    "gmail": true,
    "sendgrid": false
  }
}
```

---

## Push Notification Endpoints

### Send Push Notification

Send a push notification to a user's registered devices.

**Endpoint:** `POST /push/send`

**Request Body:**

```json
{
  "userId": "user123",
  "title": "New Booking",
  "body": "You have a new booking at 10:00 AM",
  "data": {
    "bookingId": "booking123",
    "type": "booking"
  },
  "platform": "ios",
  "useKafka": false
}
```

**Parameters:**
- `userId` (required): User identifier
- `title` (required): Notification title
- `body` (required): Notification message
- `data` (optional): Custom data payload
- `platform` (optional): Target platform - `ios`, `android`, or `web`
- `useKafka` (optional): Process via Kafka

**Response (200):**

```json
{
  "success": true,
  "message": "Push notification sent",
  "results": [
    {
      "success": true,
      "messageId": "fcm-message-id",
      "provider": "fcm"
    }
  ]
}
```

---

### Register Device Token

Register a device token for push notifications.

**Endpoint:** `POST /push/device/register`

**Request Body:**

```json
{
  "userId": "user123",
  "token": "device-fcm-or-apns-token",
  "platform": "ios",
  "deviceId": "ABC123",
  "deviceModel": "iPhone 14 Pro",
  "osVersion": "17.0",
  "appVersion": "1.0.0"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Device token registered",
  "deviceToken": {
    "id": "uuid",
    "userId": "user123",
    "platform": "ios",
    "token": "device-token",
    "isActive": true
  }
}
```

---

### Unregister Device Token

Remove a device token from the system.

**Endpoint:** `POST /push/device/unregister`

**Request Body:**

```json
{
  "token": "device-token-to-remove"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Device token unregistered"
}
```

---

## Health Check

### Service Health

Check if the service is running.

**Endpoint:** `GET /health`

**Response (200):**

```json
{
  "success": true,
  "message": "Notification service is running",
  "timestamp": "2023-11-28T18:41:50.000Z"
}
```

---

## Available Templates

### Email Templates

- `otp_login` - OTP for login
- `otp_verification` - Email verification OTP
- `password_reset` - Password reset OTP
- `booking_confirmation` - Booking confirmation email
- `push_notification` - Generic push template

### Template Variables

#### OTP Templates
- `{{otp}}` - The OTP code
- `{{userName}}` - User's name
- `{{expiryMinutes}}` - OTP expiry time
- `{{appName}}` - Application name

#### Booking Template
- `{{userName}}` - User's name
- `{{serviceName}}` - Service name
- `{{bookingDate}}` - Booking date
- `{{bookingTime}}` - Booking time
- `{{location}}` - Location

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

**Common Status Codes:**
- `200` - Success
- `202` - Accepted (queued for async processing)
- `400` - Bad Request (validation error)
- `500` - Internal Server Error
