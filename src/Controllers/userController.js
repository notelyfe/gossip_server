const User = require('../Model/User')
const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { verificationMail } = require('../Services/mailService')

const getUser = async (req, res) => {

    const user = await User.find().select("-password")
    res.json(user)

}

const createUser = async (req, res) => {

    try {

        let errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        let userId = await User.findOne({ user_id: req.body.user_id })
        let user = await User.findOne({ email: req.body.email })

        if (user) {
            return res.status(400).json({ message: "User with this email already exist" })
        }

        if (userId) {
            return res.status(400).json({ message: "User id already taken" })
        }

        const salt = await bcrypt.genSalt(10)
        const securePass = await bcrypt.hash(req.body.password, salt)

        user = await User.create({
            name: req.body.name,
            user_id: req.body.user_id,
            email: req.body.email,
            password: securePass,
            user_type: "user",
            isVerified: false,
            isActive: true
        })

        res.status(200).json({ message: "User Created Successfully" })

        // let msg = await verificationMail(req.body.email)

    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" })
    }
}

const verifyUser = async (req, res) => {
    try {

    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

const login = async (req, res) => {
    try {

        const { login_cred, password } = req.body

        const findByUserId = await User.findOne({ user_id: login_cred })
        const findByEmail = await User.findOne({ email: login_cred })

        if (!findByUserId && !findByEmail) {
            return res.status(400).json({ message: "Invalid Credentials" })
        }

        let user = findByEmail ? findByEmail : findByUserId

        let passCompare = await bcrypt.compare(password, user.password)

        if (passCompare) {

            const data = {
                user: {
                    id: user.id
                }
            }
            const access_token = jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "24h" })
            const refresh_token = jwt.sign(data, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "24h" })

            // res.cookie("jwt", refresh_token, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 24 * 60 * 60 * 1000 })
            res.cookie("jwt", refresh_token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 })
            res.json({ access_token })

        } else {
            return res.status(400).json({ message: "Invalid Password" })
        }

    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

const getUserData = async (req, res) => {

    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('-password')
        res.json(user)
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

module.exports = {
    getUser,
    createUser,
    login,
    getUserData,
    verifyUser
}