const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");
const User = require("../models/userModel");

exports.sendMessage = async (req, res, next) => {
    const { content, chatId } = req.body
    if (!content || !chatId) {
        return res.status(400).json({ error: 'Missing required fields: content and chatId' });
    }
    try {
        var newMessage = {
            sender: req.user._id,
            content: content,
            chat: chatId
        }
        let message = await Message.create(newMessage)
        message = await message.populate('sender', 'name pic')
        message = await message.populate('chat')
        message = await User.populate(message, {
            path: "chat.users",
            select: "name pic email",
        });
        await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });
        res.json(message);
    } catch (e) {
        console.error(e)
        return res.status(500).json({ error: 'Internal server error' });
    }
}

exports.allMessages = async (req, res, next) => {
    try {
        const messages = await Message.find({ chat: req.params.chatId }).populate("sender", "name pic email").populate('chat')
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: "Internal server error" })
    }
}