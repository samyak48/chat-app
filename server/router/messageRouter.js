const express = require('express');
const router = express.Router()
const messageController = require('../controller/messageController');
const { authenticate } = require('../middleware/authMiddleware');

router.post("/", authenticate, messageController.sendMessage)
router.get("/:chatId", authenticate, messageController.allMessages)


module.exports = router