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

        let chatId = req.body.chatId

        let chat = await Chat.findById({ _id: chatId })

        let receivers = []

        for(let i=0; i<chat.users.length; i++){
            if(chat.users[i].toString() !== req.user.id){
                receivers.push(chat.users[i])
            }
        }

        var newMsg = await Message.create({
            chat: chatId,
            sender: req.user.id,
            receivers: receivers,
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

const deleteMessages = async (req, res) => {
    try {

        let msgId = req.body.msgId;

        await Message.findByIdAndDelete({ _id: msgId })

        res.status(200).json({ message: "Delete successfully" })

    } catch (error) {
        res.sendStatus(500)
    }
}

module.exports = {
    sendMessage,
    getAllMsg,
    deleteMessages
}