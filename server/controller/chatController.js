const Chat = require("../models/chatModel")
const User = require("../models/userModel")
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

exports.accessChat = async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ message: 'Missing userId' });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        let chat = await Chat.findOne({
            isGroupChat: false,
            users: { $all: [req.user._id, userId] },
        })
            .populate('users', '-password')
            .populate('latestMessage');

        if (chat) {
            chat = await User.populate(chat, {
                path: 'latestMessage.sender',
                select: 'name pic email',
            });
            return res.status(200).json(chat);
        }

        const chatData = {
            chatName: 'sender',
            isGroupChat: false,
            users: [req.user._id, userId],
        };
        chat = await Chat.create(chatData);
        chat = await Chat.findById(chat._id)
            .populate('users', '-password');

        res.status(200).json(chat);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.fetchChats = async (req, res, next) => {
    try {
        var chats = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
            .populate("users", "-password")
            .populate("groupAdmin", "-password")
            .populate("latestMessage")
            .sort({ updatedAt: -1 })
        chats = await User.populate(chats, {
            path: "latestMessage.sender",
            select: "name pic email",
        })
        res.status(200).json(chats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.createGroupchat = async (req, res, next) => {
    const { users, name } = req.body;
    if (!users || !name) {
        return res.status(400).send({ message: "Please fill all the fields" });
    }
    // console.log(users)
    // console.log(typeof (users))
    let parsedUsers;
    try {
        parsedUsers = JSON.parse(users);
    } catch (error) {
        return res.status(400).send({ message: "Invalid users format" });
    }
    // console.log(parsedUsers)
    // console.log(typeof (parsedUsers))

    if (parsedUsers.length < 2) {
        return res.status(400).send("More thaan 2 users are required to form a group chat");
    }

    parsedUsers.push(req.user._id);
    // console.log(parsedUsers)
    try {
        const groupChat = await Chat.create({
            chatName: name,
            users: parsedUsers,
            isGroupChat: true,
            groupAdmin: req.user._id,
        });
        const fullGroupChat = await Chat.findById(groupChat._id)
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        res.status(200).json(fullGroupChat);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
}

exports.renameGroup = async (req, res, next) => {
    try {
        const { chatId, chatName } = req.body;
        if (!chatId || !chatName) {
            return res.status(400).send({ message: "Please provide chatId and newName" });
        }
        const chat = await Chat.findById(req.body.chatId);
        if (!chat) {
            return res.status(404).send({ message: "Chat not found" });
        }
        if (!chat.isGroupChat) {
            return res.status(400).send({ message: "This is not a group chat" });
        }
        if (chat.groupAdmin.toString() !== req.user.id) {
            return res.status(403).send({ message: "You are not authorized to rename this chat" });
        }

        // chat.chatName = chatName;
        // const updatedChat = await chat.save();
        // const populatedChat = await Chat.findById(updatedChat._id)
        //     .populate("users", "-password")
        //     .populate("groupAdmin", "-password")
        //     .exec();
        // res.status(200).send({ message: "Chat name updated successfully", chat: populatedChat });

        const updateChat = await Chat.findByIdAndUpdate(
            chatId,
            {
                chatName: chatName,
            },
            {
                new: true,
            }
        ).populate("users", "-password")
            .populate("groupAdmin", "-password")
        if (!updateChat) {
            return res.status(404).send({ message: "Chat not found" });
        } else {
            res.status(200).json(updateChat);

        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
}

exports.addToGroup = async (req, res, next) => {
    try {
        let { chatId, userIds } = req.body;

        if (!chatId || !userIds) {
            return res.status(400).send({ message: "Please provide a valid chatId and userIds" });
        }

        if (typeof userIds === "string") {
            userIds = JSON.parse(userIds);
        }

        if (!Array.isArray(userIds)) {
            return res.status(400).send({ message: "userIds should be an array" });
        }

        const chat = await Chat.findById(chatId);

        if (!chat) {
            return res.status(404).send({ message: "Chat not found" });
        }

        if (!chat.isGroupChat) {
            return res.status(400).send({ message: "This is not a group chat" });
        }

        if (chat.groupAdmin.toString() !== req.user.id) {
            return res.status(403).send({ message: "You are not authorized to add users to this chat" });
        }

        const validUserIds = userIds.filter(userId => ObjectId.isValid(userId)).map(userId => new ObjectId(userId));

        if (validUserIds.length !== userIds.length) {
            return res.status(400).send({ message: "Some userIds are not valid ObjectIds" });
        }

        const newUsers = validUserIds.filter(userId => !chat.users.includes(userId.toString()));

        if (newUsers.length === 0) {
            return res.status(400).send({ message: "All users are already in the chat" });
        }

        chat.users.push(...newUsers);
        const updatedChat = await chat.save();

        const populatedChat = await Chat.findById(updatedChat._id)
            .populate("users", "-password")
            .populate("groupAdmin", "-password")
            .exec();

        res.status(200).send({ message: "Users added to the chat successfully", chat: populatedChat });
    } catch (error) {
        console.error("Error adding users to the chat:", error);
        res.status(500).json({ message: 'Server Error' });
    }
}

exports.removeToGroup = async (req, res, next) => {
    let { chatId, userIds } = req.body;
    if (!chatId || !userIds) {
        return res.status(400).send({ message: "Please provide a valid chatId and userIds" });
    }
    if (typeof userIds === "string") {
        userIds = JSON.parse(userIds);
    }
    if (!Array.isArray(userIds)) {
        return res.status(400).send({ message: "userIds should be an array" });
    }

    const chat = await Chat.findById(chatId);

    if (!chat) {
        return res.status(404).send({ message: "Chat not found" });
    }

    if (!chat.isGroupChat) {
        return res.status(400).send({ message: "This is not a group chat" });
    }

    if (chat.groupAdmin.toString() !== req.user.id) {
        return res.status(403).send({ message: "You are not authorized to remove users to this chat" });
    }
    const validUserIds = userIds.filter(userId => ObjectId.isValid(userId)).map(userId => new ObjectId(userId));
    if (validUserIds.length !== userIds.length) {
        return res.status(400).send({ message: "Some userIds are not valid ObjectIds" });
    }

    chat.users = chat.users.filter(userId => !validUserIds.some(validUserId => validUserId.equals(userId)));

    await chat.save()

    const populatedChat = await Chat.findById(chat._id).populate('users', "-password").populate('groupAdmin', "-password")

    res.status(200).send({ message: "Users removed from the chat successfully", populatedChat });
}

exports.leaveChat = async (req, res, next) => {
    const { chatId } = req.body
    if (!chatId) {
        return res.status(400).send({ message: "Please provide a valid chatId" });
    }
    try {
        let chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).send({ message: "Chat not found" });
        }
        if (!chat.isGroupChat) {
            return res.status(400).send({ message: "This is not a group chat" });
        }

        const userId = new ObjectId(req.user._id);
        const usersArray = chat.users.map(user => new ObjectId(user));

        const updatedUsersArray = usersArray.filter(user => !user.equals(userId));
        chat.users = updatedUsersArray

        const userID = req.user._id.toString();
        const groupAdminId = chat.groupAdmin.toString()

        if (userID == groupAdminId) {
            chat.groupAdmin = chat.users[0]
        }

        await chat.save()

        const populatedChat = await Chat.findById(chat._id).populate('users', "-password").populate('groupAdmin', "-password")
        res.status(200).send({ message: "Users leave from the chat successfully", populatedChat });
    } catch (e) {
        res.status(500).json({ message: 'Server Error' });
    }
}