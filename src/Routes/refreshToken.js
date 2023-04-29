const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')

router.get('/', (req, res) => {
    try {

        let uid = req.body.id;

        if (!uid) {
            return res.sendStatus(403)
        }

        const cookies = req.cookies

        if (!cookies?.jwt) {
            return res.sendStatus(401)
        }

        const refreshToken = cookies.jwt;

        const data = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)

        if (data.user.id !== uid) {
            return res.sendStatus(403)
        }

        const newData = {
            user: {
                id: data.user.id
            }
        }

        const access_token = jwt.sign(newData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' })

        res.json({ access_token })

    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" })
    }
})

module.exports = router