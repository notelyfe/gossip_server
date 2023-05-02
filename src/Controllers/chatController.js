const Chat = require('../Model/Chat')
const User = require('../Model/User')

const createChat = async (req, res) => {

    try {

        const { userId } = req.body

        if (!userId) {
            return res.sendStatus(400)
        }

        var isChat = await Chat.find({
            isGroupChat: false,
            $and: [
                { users: { $elemMatch: { $eq: req.user.id } } },
                { users: { $elemMatch: { $eq: userId } } }
            ],
        })
            .populate("users", "-password", "-email")
            .populate("latestMsg")


        isChat = await User.populate(isChat, {
            path: "latestMsg.sender",
            select: "name user_id"
        });

        if (isChat.length > 0) {
            res.send(isChat[0])
        } else {

            var chatData = await Chat.create({
                chatName: "End To End User Chat",
                isGroupChat: false,
                users: [req.user.id, userId],
                latestMsg: null
            })

            const FullChat = await Chat.findOne({ _id: chatData._id }).populate(
                "users",
                "-password"
            )

            res.status(200).json(FullChat)
        }

    } catch (error) {
        res.status(500).json(error)
    }
}

const getUsersChat = async (req, res) => {

    try {

        let allChat = await Chat.find({
            users: { $elemMatch: { $eq: req.user.id } }
        })
            .populate("users", "-password")
            .populate("groupAdmins", "-password")
            .populate("latestMsg")
            .sort({ updatedAt: -1 })

        let newAllChat = await User.populate(allChat, {
            path: "latestMsg.sender",
            select: "name user_id"
        })

        res.status(200).json(newAllChat)

    } catch (error) {
        res.sendStatus(500)
    }

}

const deleteChat = async (req, res) => {

    try {

        const { conversationId } = req.body

        const conversationInfo = await ConversationRef.findById({ _id: conversationId })

        if (!conversationInfo) {
            return res.status(400).json({ message: "not found" })
        }

        await ConversationRef.findByIdAndUpdate({ _id: conversationId }, { isDeleted: true })

        res.status(200).json({ message: "Conversation Deleted" })

    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" })
    }

}

module.exports = {
    createChat,
    getUsersChat,
    deleteChat
}