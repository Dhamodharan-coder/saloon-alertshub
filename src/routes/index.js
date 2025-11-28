const express = require("express");
const otpRoutes = require("./otp.routes");
const emailRoutes = require("./email.routes");
const pushRoutes = require("./push.routes");

const router = express.Router();

router.use("/otp", otpRoutes);
router.use("/email", emailRoutes);
router.use("/push", pushRoutes);

router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Notification service is running",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
