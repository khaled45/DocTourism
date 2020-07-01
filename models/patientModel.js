var mongoose = require('mongoose')

let patientModel = new mongoose.model('Patient', {
    _id: mongoose.Schema.Types.ObjectId,
    username: {
        type: String,
        required: true,
        max: 30
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
    age: {
        type: Number,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    arrivelDate: {
        type: Date,
    },
    leaveDate: {
        type: Date,
    },
    profileImg: {
        type: String,
        default: "https://img.pngio.com/clip-art-openclipart-user-profile-facebook-free-content-facebook-facebook-profile-png-900_660.jpg"
    },
    diagnosisForm: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Diagnosis'
    }],

    programID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "programs",
    },
    CreatedDate: {
        type: Date,
        default: Date.now // day , month , year
    },
})

module.exports = patientModel


