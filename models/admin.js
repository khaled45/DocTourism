var mongoose = require('mongoose')

let adminModel = new mongoose.model('admin', {
    _id: mongoose.Schema.Types.ObjectId,

    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
        min: 8,
        max: 255
    },
    phone: {
        type: Number
    },
    email: {
        type: String,
        required: true,
        unique: true,
        max: 255
    },
    approving : [{
        type: mongoose.Schema.Types.ObjectId,
         ref: 'travelAgent' 
    }]
})

module.exports = adminModel