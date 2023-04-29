const whitelist = []

const corsControl = {
    origin: (origin, callback) => {
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, origin)
        } else {
            callback(new Error('Not Allowed By Cors'))
        }
    },
    optionsSuccessStatus: 200
}

module.exports = corsControl