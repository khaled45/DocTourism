var mongoose = require('mongoose')

let travelAgentModel = new mongoose.model('travelAgent', {
    _id: mongoose.Schema.Types.ObjectId,
    companyName: {
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
    location: {

        type: Object,
        required: true
    },
    patientsID: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient'
    }],
    profileImg: {
        type: String,
        defult: "https://img.pngio.com/clip-art-openclipart-user-profile-facebook-free-content-facebook-facebook-profile-png-900_660.jpg"
    },

    tourismPrograms: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'programs'
    }],
    
    isApproved: {
        type: String
    }



})

module.exports = travelAgentModel


