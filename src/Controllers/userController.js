const User = require('../Model/User')
const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { verificationMail } = require('../Services/mailService')

const accessToken = process.env.ACCESS_TOKEN_SECRET
const refreshToken = process.env.REFRESH_TOKEN_SECRET
const clientBaseUrl = process.env.CLIENT_BASE_URL

const getAllUser = async (req, res) => {

    try {

        let user = await User.find().select("-password")

        user = user.filter((item) => {
            return item._id.toString() !== req.user.id
        })

        res.json(user)

    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" })
    }
}

const createUser = async (req, res) => {

    try {

        let errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        let userId = await User.findOne({ user_id: req.body.user_id.toLowerCase() })
        let user = await User.findOne({ email: req.body.email.toLowerCase() })

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
            user_id: req.body.user_id.toLowerCase(),
            email: req.body.email.toLowerCase(),
            password: securePass,
            user_type: "user",
            isVerified: false,
            isActive: true
        })

        let data = {
            user: {
                id: user._id,
                userType: user.user_type
            }
        }

        const verification_token = jwt.sign(data, accessToken, { expiresIn: "24h" })

        res.status(200).json({ message: "User Created Successfully" })

        await verificationMail(req.body.email, verification_token)

    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" })
    }
}

const verifyUser = async (req, res) => {
    try {

        let verifyToken = req.query.verificationToken

        if (!verifyToken) {
            return res.sendStatus(401)
        }

        let userData = jwt.verify(verifyToken, accessToken)

        const user = await User.findById({ _id: userData?.user?.id })

        if (!user) {
            return res.status(401).json({ message: "token expired or tempered" })
        }

        await User.findByIdAndUpdate({ _id: userData?.user?.id }, { isVerified: true })

        res.redirect(`${clientBaseUrl}/login`)

    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

const login = async (req, res) => {
    try {

        const { login_cred, password } = req.body

        const findByUserId = await User.findOne({ user_id: login_cred.toLowerCase() })
        const findByEmail = await User.findOne({ email: login_cred.toLowerCase() })

        if (!findByUserId && !findByEmail) {
            return res.status(400).json({ message: "Invalid Credentials" })
        }

        let user = findByEmail ? findByEmail : findByUserId

        if (user?.isVerified === false) {
            return res.status(403).json({ message: "Please verify you email to login" })
        }

        let passCompare = await bcrypt.compare(password, user.password)

        if (passCompare) {

            const data = {
                user: {
                    id: user.id
                }
            }
            const access_token = jwt.sign(data, accessToken, { expiresIn: "15m" })
            const refresh_token = jwt.sign(data, refreshToken, { expiresIn: "24h" })

            res.cookie("jwt", refresh_token, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 24 * 60 * 60 * 1000 })
            // res.cookie("jwt", refresh_token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 })
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
    getAllUser,
    createUser,
    login,
    getUserData,
    verifyUser
}