require('dotenv').config()

const express = require('express')
const connectToMongoose = require('./src/Config/db')
const app = express()
const cors = require('cors')

const port = process.env.PORT

app.use(cors())
app.use(express.json())

app.use('/api/admin', require('./src/Routes/admin'))

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})

app.get('*', (req, res) => {
    res.json({ message: "404 Page Not Found" })
})

connectToMongoose()