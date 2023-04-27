const mongoose = require('mongoose')

const mongoUri = process.env.URI

const connectToMongoose = () => {
    mongoose.connect(mongoUri)
    console.log("Connected to Mongo Success")
}

module.exports = connectToMongoose