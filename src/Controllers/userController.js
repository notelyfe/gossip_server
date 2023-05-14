const User = require('../Model/User')
const Chat = require('../Model/Chat')
const Message = require('../Model/Message')
const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { verificationMail, passwordResetVerification } = require('../Services/mailService')
const { uploadFile, deleteFile, editFile } = require('../Services/awsSdk')

const accessToken = process.env.ACCESS_TOKEN_SECRET
const refreshToken = process.env.REFRESH_TOKEN_SECRET

const getAllUser = async (req, res) => {

    try {

        let user = await User.find().select(["-password", "-profile_key"])

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
            isActive: true,
            restriction: [{
                isRestricted: false,
                reason: ''
            }],
            profile_pic: null,
            profile_key: null
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

        let verifyToken = req.params.verificationToken

        if (!verifyToken) {
            return res.sendStatus(401)
        }

        let userData = jwt.verify(verifyToken, accessToken)

        const user = await User.findById({ _id: userData?.user?.id })

        if (!user) {
            return res.status(401).json({ message: "token expired or tempered" })
        }

        await User.findByIdAndUpdate({ _id: userData?.user?.id }, { isVerified: true })

        res.status(200).json({ message: "E-mail verified successfully" })

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
        const user = await User.findById(userId).select(['-password', '-profile_key'])
        res.json(user)
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

const editUserInfo = async (req, res) => {
    try {

        let user_by_userid = await User.findOne({ user_id: req.body.userId.toLowerCase() })
        // let user_by_email = await User.findOne({ email: req.body.email.toLowerCase() })

        // if (user_by_email) {
        //     return res.status(400).json({ message: "User with this email already exist" })
        // }

        if (user_by_userid) {
            return res.status(400).json({ message: "User id already taken" })
        }

        const userInfo = await User.findById({ _id: req.user.id })

        if (!userInfo) {
            return res.status(401).json({ message: "token is tempered" })
        }

        const newUserInfo = ({
            name: req.body.name,
            user_id: req.body.userId.toLowerCase(),
            // email: req.body.email.toLowerCase(),
        })

        await User.findByIdAndUpdate({ _id: req.user.id }, newUserInfo)
        res.status(200).json({ message: "updated successfully" })

    } catch (error) {
        res.sendStatus(500)
    }
}

const editUserProfile = async (req, res) => {
    try {

        let user = await User.findById({ _id: req.user.id })

        if (!user) {
            return res.status(401).json({ message: "action not allowed" })
        }

        if (user.profile_key === null) {

            const profile_image = await uploadFile(req.file, user?.email)

            let imageInfo = ({
                profile_pic: profile_image.Location,
                profile_key: profile_image.Key
            })

            let image = await User.findByIdAndUpdate({ _id: req.user.id }, imageInfo)

            res.status(200).json({ message: "Image uploaded" })

        } else {
            await editFile(req.file, user?.email)
            res.status(200).json({ message: "Image edited" })
        }

    } catch (error) {
        res.send(error)
    }
}

const sendPassResetLink = async (req, res) => {
    try {

        let cred = req.body.credential

        if (!cred) {
            return res.status(400).json({ message: "Invalid Data" })
        }

        const userById = await User.findOne({ user_id: cred })
        const userByEmail = await User.findOne({ email: cred })

        let user = userById ? userById : userByEmail

        if (!user) {
            return res.status(404).json({ message: "User with this id doesn't found" })
        }

        let data = {
            user: {
                id: user._id,
                userType: user.user_type
            }
        }

        const verification_token = jwt.sign(data, accessToken, { expiresIn: "10m" })

        passwordResetVerification(user?.email, verification_token)

        res.status(200).json({ message: "verification email has been sent on your registered email" })

    } catch (error) {
        res.sendStatus(500)
    }
}

const ResetPassword = async (req, res) => {
    try {

        const { password, confirmPassword } = req.body

        const user = await User.findById({ _id: req.user.id })

        if (!user) {
            return res.status(401).json({ message: "Action not allowed" })
        }

        if (password !== confirmPassword || !password || !confirmPassword) {
            return res.status(400).json({ message: "Password didn't match" })
        }

        const salt = await bcrypt.genSalt(10)
        const securePass = await bcrypt.hash(password, salt)

        await User.findByIdAndUpdate({ _id: req.user.id }, { password: securePass })

        res.status(200).json({ message: "Password updated" })

    } catch (error) {
        res.sendStatus(500)
    }
}

const deleteUser = async (req, res) => {
    try {

        let id = req.user.id
        let password = req.body.password

        const user = await User.findById({ _id: id })

        if (!user) {
            return res.status(404).json({ message: "user doesn't exist" })
        }

        let comparePass = await bcrypt.compare(password, user.password)
        if (!comparePass) {
            return res.status(401).json({ message: "wrong password" })
        }

        if (user.profile_key !== null) {
            await deleteFile(user.profile_key)
        }

        let chatIds = []
        let msgIds = []

        let allChat = await Chat.find({
            users: { $elemMatch: { $eq: req.user.id } }
        })
        allChat.map((item) => {
            if (item.isGroupChat === false) {
                chatIds.push(item._id.toString())
            }
        })

        for (let i = 0; i < chatIds.length; i++) {

            let messages = await Message.find({ chat: chatIds[i].toString() })

            if (messages.length > 0) {
                messages.map((item) => {
                    msgIds.push(item._id.toString())
                })
            }
        }

        for (let i = 0; i < msgIds.length; i++) {
            await Message.findByIdAndDelete({ _id: msgIds[i] })
        }

        for (let i = 0; i < chatIds.length; i++) {
            await Chat.findByIdAndDelete({ _id: chatIds[i] })
        }

        await User.findByIdAndDelete({ _id: req.user.id })

        res.status(200).json({ message: "User Deleted" })

    } catch (error) {
        res.sendStatus(500)
    }
}

module.exports = {
    getAllUser,
    createUser,
    login,
    getUserData,
    verifyUser,
    editUserInfo,
    editUserProfile,
    sendPassResetLink,
    ResetPassword,
    deleteUser
}