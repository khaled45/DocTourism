var mongoose = require('mongoose')

let patientModel = new mongoose.model('Patient', {
    _id: mongoose.Schema.Types.ObjectId,
    username: {
        type: String,
        required: true,
        unique: true,
        max: 20,
        min: 5
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
    age: Number,
    gender: {
        type: String,
        required: true
    },
    arrivelDate: {
        type: Date,
        required: true
    },
    leaveDate: {
        type: Date,
        required: true
    },
    profileImg: {
        type: String,
        defult: "https://img.pngio.com/clip-art-openclipart-user-profile-facebook-free-content-facebook-facebook-profile-png-900_660.jpg"
    },
    diagnosisForm: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Diagnosis' }]



})

module.exports = patientModel


