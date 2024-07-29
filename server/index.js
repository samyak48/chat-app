const express = require('express');
const cors = require('cors')
const connectDB = require('./config/db');
const userRouter = require('./router/userRoute')
const chatRouter = require('./router/chatRouter')
const messageRouter = require('./router/messageRouter')
const appError = require('./utils/appError')
const errorHandler = require('./middleware/errorMiddleware')
const cookieParser = require('cookie-parser');
const path = require("path");

require('dotenv').config()

const app = express();

app.use(express.json());

app.use(cookieParser());

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))

connectDB()

app.use('/api/user', userRouter);
app.use('/api/chat', chatRouter)
app.use('/api/message', messageRouter)
// app.use('/api/messages', messageRouter)

//------------------------------deployment------------------------------
// const __dirname1 = path.resolve();
// console.log(process.env.NODE_ENV)
// if (process.env.NODE_ENV === "production") {
//     app.use(express.static(path.join(__dirname1, "/client/dist")));

//     app.get("*", (req, res) =>
//         res.sendFile(path.resolve(__dirname1, "client", "dist", "index.html"))
//     );
// } else {
//     app.get("/", (req, res) => {
//         res.send("API is running..");
//     });
// }
//------------------------------deployment------------------------------
app.use((req, res, next) => {
    next(new appError('Api Not Found', 404));
});
app.use(errorHandler)

const server = app.listen(process.env.PORT)


const io = require("socket.io")(server, {
    pingTimeout: 60000,
    cors: {
        origin: "http://localhost:5173",
    },
});
io.on("connection", (socket) => {
    // console.log("connected to socket.io")
    socket.on("setup", (userData) => {
        socket.join(userData._id);
        // console.log(userData._id)
        socket.emit("connected")
    })

    socket.on("join chat", (room) => {
        socket.join(room)
        console.log("user joined room " + room)
    })

    socket.on("typing", (room) => socket.in(room).emit("typing"))
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"))

    socket.on("new message", (newMessageRecived) => {
        var chat = newMessageRecived.chat
        if (!chat.users) return console.log("chat.users not define")

        chat.users.forEach(user => {
            if (user._id == newMessageRecived.sender._id)
                return
            socket.in(user._id).emit("message recived", newMessageRecived)
        })
    })
})