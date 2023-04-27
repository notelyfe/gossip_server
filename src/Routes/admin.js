const express = require('express')
const router = express.Router()
const Admin = require('../Model/Admin')
const { body, validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const jwt_secret = process.env.JWT_SECRET

// <--create admin using post method '/api/admin/createAdmin'-->
router.post('/createAdmin', [
    body("name").isLength({ min: 1 }),
    body("user_id").isLength({ min: 5 }),
    body("email").isLength({ min: 5 }),
    body("password").isLength({ min: 8 }),
    body("user_type")
], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    try {

        let admin = await Admin.findOne({ email: req.body.email })
        let userId = await Admin.findOne({ user_id: req.body.user_id })

        if (admin) {
            return res.status(400).json({ error: "Admin with this email is already exist" })
        }

        if (userId) {
            return res.status(400).json({ error: "user_id is not available" })
        }

        const salt = await bcrypt.genSalt(10);
        const securePass = await bcrypt.hash(req.body.password, salt)

        let createdDate = new Date()

        admin = await Admin.create({
            name: req.body.name,
            user_id: req.body.user_id,
            email: req.body.email,
            password: securePass,
            user_type: req.body.user_type,
            created_on: createdDate,
            isVerified: false,
            isActive: true
        })

        const data = {
            admin: {
                id: admin.id
            }
        }
        const access_token = jwt.sign(data, jwt_secret)
        res.json({ access_token })

    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" })
    }
})

// <--Admin Login using post method '/api/admin/login'-->
router.post('/login', async (req, res) => {

    try {

        const { user_id, password } = req.body

        let admin = await Admin.findOne({ user_id })

        if (!admin) {
            return res.status(400).json({ message: "Invalid user id" })
        }

        const passwordCompare = await bcrypt.compare(password, admin.password)

        if (!passwordCompare) {
            return res.status(400).json({ message: "Invalid Password" })
        }

        const data = {
            admin: {
                id: admin.id
            }
        }
        const access_token = jwt.sign(data, jwt_secret)

        res.json({ access_token })

    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" })
    }
})

// <--fetch Admin Data using get method '/api/admin/adminData'-->
router.get('/adminData', async (req, res) => {
    
})

module.exports = router