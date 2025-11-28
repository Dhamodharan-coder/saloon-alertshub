const express = require("express");
const pushController = require("../controllers/push.controller");

const router = express.Router();

router.post("/send", pushController.sendPushNotification);
router.post("/device/register", pushController.registerDevice);
router.post("/device/unregister", pushController.unregisterDevice);

module.exports = router;
