const express = require('express')
const router = express.Router()
const adminController = require('../Controllers/adminController')
const verifyJWT = require('../Middleware/verifyJwt')
const { body } = require('express-validator')


router.post('/createAdmin', [
    body("name").isLength({ min: 1 }),
    body("user_id").isLength({ min: 5 }),
    body("email").isLength({ min: 5 }),
    body("password").isLength({ min: 8 }),
    body("user_type")
], adminController.createAdmin)

router.post('/login', adminController.login)

router.get('/adminData', verifyJWT, adminController.adminData)

module.exports = router