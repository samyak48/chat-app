const jwt = require('jsonwebtoken')
const User = require('../models/userModel')

exports.authenticate = async (req, res, next) => {
    let token
    if (req.cookies && req.cookies.token) {
        token = req.cookies.token
    }
    try {
        if (!token) return res.status(401).json({ message: 'Token is not provided' })
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = await User.findById(decoded.id)
        next()
    } catch (err) {
        console.error(err)
        return res.status(401).json({ message: 'Token is not valid' })
    }
}