require('dotenv').config()

const express = require('express')
const connectToMongoose = require('./src/Config/db')
const app = express()
const cors = require('cors')
const corsControl = require('./src/Config/corsOptions')
const cookieParser = require('cookie-parser')
const { socketConnection } = require('./src/Socket/socket')

const port = process.env.PORT

// app.use(cors())
app.use(cors(corsControl))
app.use(express.json())

// <--middleware for cookies-->
app.use(cookieParser());

app.use('/api/admin', require('./src/Routes/admin'))
app.use('/api/refresh', require('./src/Routes/refreshToken'))
app.use('/api/logout', require('./src/Routes/logout'))
app.use('/api/user', require('./src/Routes/user'))
app.use('/api/chat', require('./src/Routes/chat'))
app.use('/api/msg', require('./src/Routes/message'))

const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})

socketConnection(server)

app.get('*', (req, res) => {
    res.json({ message: "404 Page Not Found" })
})

connectToMongoose()