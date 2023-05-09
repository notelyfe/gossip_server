const express = require('express')
const router = express.Router()
const { getAllUser, createUser, login, getUserData, verifyUser, editUserInfo, editUserProfile, sendPassResetLink, ResetPassword } = require('../Controllers/userController')
const { body } = require('express-validator')
const verifyJWT = require('../Middleware/verifyJwt')
const { upload } = require('../Middleware/multer')

router.get('/getuser', verifyJWT, getAllUser)

router.post('/createUser', [
    body("name").isLength({ min: 5 }),
    body("user_id").isLength({ min: 5 }),
    body("email").isLength({ min: 1 }),
    body("password").isLength({ min: 8 }),
], createUser)

router.get('/verify', verifyUser)

router.post('/login', login)

router.get('/userData', verifyJWT, getUserData)

router.put('/editUserInfo', verifyJWT, editUserInfo)

router.put('/editUserProfile', verifyJWT, upload.single("profilePic"), editUserProfile)

router.post('/resetLink', sendPassResetLink)

router.patch('/passwordReset', verifyJWT, ResetPassword)

module.exports = router