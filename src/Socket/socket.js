const { Server } = require('socket.io')

const socketConnection = (socketServer) => {

    const io = new Server(socketServer, {
        pingTimeout: 60000,
        cors: {
            origin: process.env.CLIENT_BASE_URL
        }
    });

    io.on("connect", (socket) => {

        socket.on("setup", (userId) => {
            socket.join(userId);
            socket.emit("connected")
        });

        socket.on("join room", (room) => {
            socket.join(room)
        })

        socket.on("new messages", (newMessageReceived, messages) => {
            var chat = newMessageReceived;

            if (!chat.receivers) return console.log("user not found")

            chat.receivers.forEach((user) => {
                socket.in(user).emit("message received", newMessageReceived, messages)
            });

        })

        socket.off("setup", () => {
            console.log("USER DISCONNECTED");
            socket.leave(userId);
        });

    })
}

module.exports = {
    socketConnection
}