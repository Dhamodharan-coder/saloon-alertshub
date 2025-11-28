const otpService = require("../../src/services/otp.service");
const db = require("../../src/config/database");
const redis = require("../../src/config/redis");

describe("OTP Service", () => {
  beforeAll(async () => {
    await db.migrate.latest();
  });

  afterAll(async () => {
    await redis.flushall();
    await db.destroy();
  });

  beforeEach(async () => {
    await db("otps").del();
  });

  describe("createOTP", () => {
    it("should create a new OTP", async () => {
      const result = await otpService.createOTP("test@example.com", "login");

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("otp");
      expect(result.otp).toHaveLength(6);
      expect(result).toHaveProperty("expiresAt");
    });

    it("should revoke existing active OTPs", async () => {
      await otpService.createOTP("test@example.com", "login");
      const result = await otpService.createOTP("test@example.com", "login");

      const otps = await db("otps")
        .where({ identifier: "test@example.com", purpose: "login" });

      const activeOtps = otps.filter((otp) => otp.status === "active");
      expect(activeOtps).toHaveLength(1);
      expect(activeOtps[0].id).toBe(result.id);
    });

    it("should enforce rate limiting", async () => {
      const max = 5;
      const promises = [];

      for (let i = 0; i < max + 1; i++) {
        promises.push(otpService.createOTP("ratelimit@example.com", "login"));
      }

      await expect(Promise.all(promises)).rejects.toThrow("Rate limit exceeded");
    });
  });

  describe("verifyOTP", () => {
    it("should verify a valid OTP", async () => {
      const { otp } = await otpService.createOTP("test@example.com", "login");
      const result = await otpService.verifyOTP("test@example.com", otp, "login");

      expect(result.verified).toBe(true);
    });

    it("should reject an invalid OTP", async () => {
      await otpService.createOTP("test@example.com", "login");

      await expect(
        otpService.verifyOTP("test@example.com", "999999", "login")
      ).rejects.toThrow();
    });

    it("should enforce max attempts", async () => {
      await otpService.createOTP("test@example.com", "login");

      for (let i = 0; i < 3; i++) {
        try {
          await otpService.verifyOTP("test@example.com", "999999", "login");
        } catch (error) {
          // Expected to fail
        }
      }

      await expect(
        otpService.verifyOTP("test@example.com", "999999", "login")
      ).rejects.toThrow("Maximum verification attempts exceeded");
    });
  });
});
