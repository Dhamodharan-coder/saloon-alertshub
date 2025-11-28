const express = require("express");
const emailController = require("../controllers/email.controller");

const router = express.Router();

router.post("/send", emailController.sendEmail);
router.get("/health", emailController.healthCheck);

module.exports = router;
