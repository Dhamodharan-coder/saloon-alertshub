const request = require("supertest");
const app = require("../../src/index");

describe("API Endpoints", () => {
  describe("GET /api/v1/health", () => {
    it("should return health status", async () => {
      const response = await request(app).get("/api/v1/health");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("POST /api/v1/otp/request", () => {
    it("should request an OTP", async () => {
      const response = await request(app)
        .post("/api/v1/otp/request")
        .send({
          identifier: "test@example.com",
          purpose: "login",
          userName: "Test User",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it("should return 400 for missing fields", async () => {
      const response = await request(app)
        .post("/api/v1/otp/request")
        .send({
          identifier: "test@example.com",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/v1/push/device/register", () => {
    it("should register a device token", async () => {
      const response = await request(app)
        .post("/api/v1/push/device/register")
        .send({
          userId: "user123",
          token: "device-token-123",
          platform: "ios",
          deviceId: "ABC123",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
