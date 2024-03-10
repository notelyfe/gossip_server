// const whitelist = ['https://gossip.notelyfe.me']
const whitelist = ['https://gossip.notelyfe.me', 'https://notelyfe.me']

// const whitelist = ['http://localhost:3000']

const corsControl = {
    origin: (origin, callback) => {
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, origin)
        } else {
            callback(new Error('Not Allowed By Cors'))
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
}

module.exports = corsControl
