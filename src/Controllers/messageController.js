const Message = require('../Model/Message')
const User = require('../Model/User')
const Chat = require('../Model/Chat')
const { validationResult } = require('express-validator')

const sendMessage = async (req, res) => {

    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.sendStatus(400)
        }

        var newMsg = await Message.create({
            chat: req.body.chatId,
            sender: req.user.id,
            receiver: req.body.receiver,
            content: req.body.content,
            isDeleted: false
        })

        await Chat.findByIdAndUpdate({ _id: req.body.chatId }, { latestMsg: newMsg })

        res.json(newMsg)

    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" })
    }

}

const getAllMsg = async (req, res) => {

    try {

        const messages = await Message.find({ chat: req.body.chatId })

        res.json(messages)

    } catch (error) {
        res.sendStatus(500)
    }
}

module.exports = {
    sendMessage,
    getAllMsg
}