const express = require('express')
const { registerValidationResults, loginValidationResults, validateRequest } = require('../middleware/validator')
const router = express.Router()
const userController = require('../controller/userController')
const { authenticate } = require('../middleware/authMiddleware')

router.get('/', authenticate, userController.allUsers)
router.post('/', registerValidationResults(), validateRequest, userController.registerUser)
router.post('/login', loginValidationResults(), validateRequest, userController.loginUser)

module.exports = router