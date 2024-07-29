const mongoose = require('mongoose')
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL)
    } catch (err) {
        console.log(err.message)
        process.exit()
    }
}
module.exports = connectDB