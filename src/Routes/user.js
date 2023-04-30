const express = require('express')
const router = express.Router()
const { getUser, createUser, login, getUserData, verifyUser } = require('../Controllers/userController')
const { body } = require('express-validator')
const verifyJWT = require('../Middleware/verifyJwt')
const { main } = require('../Services/mailService')

router.get('/getuser', getUser)

router.post('/createUser', [
    body("name").isLength({ min: 5 }),
    body("user_id").isLength({ min: 5 }),
    body("email").isLength({ min: 1 }),
    body("password").isLength({ min: 8 }),
], createUser)

// router.post('/verify', verifyUser)

router.post('/login', login)

router.get('/userData', verifyJWT, getUserData)

module.exports = router