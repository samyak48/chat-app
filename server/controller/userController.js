const User = require('../models/userModel')
const jwt = require('jsonwebtoken');
const { generateToken } = require('../utils/generateToken');
exports.registerUser = async (req, res, next) => {
    try {
        const userExists = await User.findOne({ email: req.body.email });
        if (userExists) {
            return res.status(400).json({ message: 'Email already exists' })
        }
        const user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            pic: req.body.pic
        });
        const token = generateToken(user._id)

        const copyUser = user.toObject();
        delete copyUser.password;
        delete copyUser.__v;

        if (user) {
            res
                .cookie('token', token, {
                    expires: new Date(Date.now() + 3600000),
                    httpOnly: true,
                })
                .status(201)
                .json({ message: 'User registered successfully', user: copyUser })
        } else {
            res.status(400).json({ message: 'Failed to register user' })
        }
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server Error' })
    }
}

exports.loginUser = async (req, res, next) => {
    try {
        const currentUser = await User.findOne({ email: req.body.email })
        if (!currentUser) {
            return res.status(401).json({ message: 'Invalid credentials' })
        }
        const isMatch = await currentUser.matchPassword(req.body.password)
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' })
        }

        const token = generateToken(currentUser._id)

        // const copyCurrentUser = currentUser.toObject();
        // delete copyCurrentUser.password;
        // delete copyCurrentUser.__v;
        const { password, __v, ...copyCurrentUser } = currentUser.toObject();
        if (currentUser) {
            res.cookie('token', token, {
                expires: new Date(Date.now() + 3600000),
                httpOnly: true,
            })
                .status(201)
                .json({ message: 'Logged in successfully', user: copyCurrentUser })
        } else {
            res.status(401).json({ message: 'Invalid credentials' })
        }
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server Error' })
    }
}
exports.allUsers = async (req, res, next) => {
    const keyword = req.query.search
        ? {
            $or: [
                { name: { $regex: req.query.search, $options: "i" } },
                { email: { $regex: req.query.search, $options: "i" } },
            ],
        }
        : {};
    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
    res.send(users);
}