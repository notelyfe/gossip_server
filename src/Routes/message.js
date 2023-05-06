const express = require('express')
const router = express.Router()
const { sendMessage, getAllMsg } = require('../Controllers/messageController')
const verifyJWT = require('../Middleware/verifyJwt')
const { body } = require('express-validator')

router.post('/sendMsg', verifyJWT, [
    body("content").isLength({ min: 1 }),
    body("chatId").isLength({ min: 1 })
], sendMessage)

router.post('/getAllMsg', verifyJWT, getAllMsg)

module.exports = router