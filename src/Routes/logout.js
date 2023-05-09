const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    try {

        const cookies = req.cookies

        if (!cookies?.jwt) {
            return res.sendStatus(204)
        }

        res.clearCookie('jwt', { httpOnly: true })
        res.sendStatus(204)

    } catch (error) {
        res.sendStatus(500)
    }
})

module.exports = router