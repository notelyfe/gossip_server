const jwt = require('jsonwebtoken')

const jwt_secret = process.env.ACCESS_TOKEN_SECRET

const verifyJWT = (req, res, next) => {

    const authHeader = req.headers.authorization || req.headers.Authorization

    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'UnAuthorized' })
    }

    const token = authHeader.split(' ')[1]

    try {
        const data = jwt.verify(token, jwt_secret)
        req.user = data.user
        next()
    } catch (error) {
        res.status(403).json({ message: 'Access Forbidden' })
    }
}

module.exports = verifyJWT
