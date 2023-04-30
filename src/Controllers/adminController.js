const { validationResult } = require('express-validator')
const Admin = require('../Model/Admin')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const createAdmin = async (req, res) => {

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

        let createdDate = Date.now()

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

        res.json({ message: 'user created successfully' })

    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" })
    }
}

const login = async (req, res) => {

    try {

        const { user_id, password } = req.body

        let admin = await Admin.findOne({ user_id })

        if (!admin) {
            return res.status(400).json({ message: "Invalid user id" })
        }

        const passwordCompare = await bcrypt.compare(password, admin.password)

        if (passwordCompare) {

            const data = {
                user: {
                    id: admin.id
                }
            }
            const access_token = jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' })
            const refresh_token = jwt.sign(data, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '24h' })

            res.cookie('jwt', refresh_token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
            res.json({ access_token })

        } else {
            return res.status(400).json({ message: "Invalid Password" })
        }
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" })
    }
}

const adminData = async (req, res) => {
    try {
        const userId = req.user.id;
        const admin = await Admin.findById(userId).select('-password')
        res.json(admin)
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

module.exports = {
    createAdmin,
    login,
    adminData
}