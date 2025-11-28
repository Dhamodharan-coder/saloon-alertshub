const bcrypt = require("bcrypt");
const { authenticator } = require("otplib");
const db = require("../config/database");
const redis = require("../config/redis");
const logger = require("../utils/logger");

class OTPService {
  constructor() {
    this.otpLength = parseInt(process.env.OTP_LENGTH, 10) || 6;
    this.expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES, 10) || 5;
    this.maxAttempts = parseInt(process.env.OTP_MAX_ATTEMPTS, 10) || 3;
    this.rateLimitWindow = parseInt(process.env.OTP_RATE_LIMIT_WINDOW_MINUTES, 10) || 15;
    this.rateLimitMax = parseInt(process.env.OTP_RATE_LIMIT_MAX_REQUESTS, 10) || 5;
  }

  /**
   * Generate a random numeric OTP
   */
  generateOTP() {
    const min = Math.pow(10, this.otpLength - 1);
    const max = Math.pow(10, this.otpLength) - 1;
    return Math.floor(Math.random() * (max - min + 1) + min).toString();
  }

  /**
   * Check rate limiting for OTP requests
   */
  async checkRateLimit(identifier) {
    const key = `otp:ratelimit:${identifier}`;
    const count = await redis.incr(key);

    if (count === 1) {
      await redis.expire(key, this.rateLimitWindow * 60);
    }

    if (count > this.rateLimitMax) {
      const ttl = await redis.ttl(key);
      throw new Error(
        `Rate limit exceeded. Please try again in ${Math.ceil(ttl / 60)} minutes.`
      );
    }

    return true;
  }

  /**
   * Create and store OTP
   */
  async createOTP(identifier, purpose, metadata = {}) {
    try {
      // Check rate limiting
      await this.checkRateLimit(identifier);

      // Revoke any active OTPs for this identifier and purpose
      await db("otps")
        .where({ identifier, purpose, status: "active" })
        .update({ status: "revoked", updated_at: db.fn.now() });

      // Generate OTP
      const otp = this.generateOTP();
      const otpHash = await bcrypt.hash(otp, 10);

      // Calculate expiry
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + this.expiryMinutes);

      // Store in database
      const [otpRecord] = await db("otps")
        .insert({
          identifier,
          otp_hash: otpHash,
          purpose,
          status: "active",
          expires_at: expiresAt,
          metadata: JSON.stringify(metadata),
        })
        .returning("*");

      // Cache in Redis for quick validation
      const cacheKey = `otp:active:${identifier}:${purpose}`;
      await redis.setex(
        cacheKey,
        this.expiryMinutes * 60,
        JSON.stringify({
          id: otpRecord.id,
          hash: otpHash,
          attempts: 0,
        })
      );

      logger.info(`OTP created for ${identifier} (${purpose})`);

      return {
        id: otpRecord.id,
        otp, // Return plain OTP to be sent
        expiresAt,
        expiryMinutes: this.expiryMinutes,
      };
    } catch (error) {
      logger.error("Error creating OTP:", error);
      throw error;
    }
  }

  /**
   * Verify OTP
   */
  async verifyOTP(identifier, otp, purpose) {
    try {
      const cacheKey = `otp:active:${identifier}:${purpose}`;

      // Try to get from cache first
      let cachedData = await redis.get(cacheKey);
      let otpRecord;

      if (cachedData) {
        cachedData = JSON.parse(cachedData);

        // Get full record from DB
        otpRecord = await db("otps").where({ id: cachedData.id }).first();
      } else {
        // Fallback to DB query
        otpRecord = await db("otps")
          .where({
            identifier,
            purpose,
            status: "active",
          })
          .where("expires_at", ">", db.fn.now())
          .orderBy("created_at", "desc")
          .first();
      }

      if (!otpRecord) {
        throw new Error("OTP not found or expired");
      }

      // Check if already exceeded max attempts
      if (otpRecord.attempts >= this.maxAttempts) {
        await this.revokeOTP(otpRecord.id);
        throw new Error("Maximum verification attempts exceeded");
      }

      // Verify OTP
      const isValid = await bcrypt.compare(otp, otpRecord.otp_hash);

      // Increment attempts
      await db("otps")
        .where({ id: otpRecord.id })
        .update({
          attempts: otpRecord.attempts + 1,
          updated_at: db.fn.now(),
        });

      if (!isValid) {
        const remainingAttempts = this.maxAttempts - (otpRecord.attempts + 1);
        throw new Error(
          `Invalid OTP. ${remainingAttempts} attempt(s) remaining.`
        );
      }

      // Mark as verified
      await db("otps")
        .where({ id: otpRecord.id })
        .update({
          status: "verified",
          verified_at: db.fn.now(),
          updated_at: db.fn.now(),
        });

      // Remove from cache
      await redis.del(cacheKey);

      logger.info(`OTP verified successfully for ${identifier} (${purpose})`);

      return {
        success: true,
        verified: true,
      };
    } catch (error) {
      logger.error("Error verifying OTP:", error);
      throw error;
    }
  }

  /**
   * Revoke OTP
   */
  async revokeOTP(otpId) {
    await db("otps").where({ id: otpId }).update({
      status: "revoked",
      updated_at: db.fn.now(),
    });

    logger.info(`OTP ${otpId} revoked`);
  }

  /**
   * Cleanup expired OTPs (scheduled job)
   */
  async cleanupExpiredOTPs() {
    try {
      const result = await db("otps")
        .where("expires_at", "<", db.fn.now())
        .where("status", "active")
        .update({
          status: "expired",
          updated_at: db.fn.now(),
        });

      logger.info(`Cleaned up ${result} expired OTPs`);
      return result;
    } catch (error) {
      logger.error("Error cleaning up expired OTPs:", error);
      throw error;
    }
  }
}

module.exports = new OTPService();
