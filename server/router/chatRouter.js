const express = require('express')
const { authenticate } = require('../middleware/authMiddleware')
const chatController = require('../controller/chatController')
const router = express.Router()

router.post('/', authenticate, chatController.accessChat)
router.get('/', authenticate, chatController.fetchChats)

router.post('/group', authenticate, chatController.createGroupchat)
router.put('/rename', authenticate, chatController.renameGroup)

router.put('/groupadd', authenticate, chatController.addToGroup)
router.put("/groupremove", authenticate, chatController.removeToGroup)

router.put('/leavechat', authenticate, chatController.leaveChat)
module.exports = router