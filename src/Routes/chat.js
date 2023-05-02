const express = require('express')
const router = express.Router()
const { createChat, deleteChat, getUsersChat } = require('../Controllers/chatController')
const verifyJWT = require('../Middleware/verifyJwt')

router.post('/createChat', verifyJWT, createChat)
router.get('/getAllChat', verifyJWT, getUsersChat)
router.delete('/deleteConversation', verifyJWT, deleteChat)

module.exports = router