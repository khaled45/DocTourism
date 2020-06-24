var mongoose = require('mongoose')

let doctorModel = new mongoose.model('Doctor', {
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

    location: {
        type: Object // that is contain  City And Region
    },

    email: {
        type: String,
        required: true,
        unique: true,
        max: 255

    },
    gender: String,

    profileIMG: {
        type: String,
         defult: "https://img.pngio.com/clip-art-openclipart-user-profile-facebook-free-content-facebook-facebook-profile-png-900_660.jpg"
    },

    rate: {
        type: Number
    },

    briefSummery: {
        type: String,
        required: true
    },


    phone: {
        type: Number

    },

    title: {
        type: String
    },

    CreatedDate: {
        type: Object // day , month , year
    },

    Questions: [{ type: Object }], //hold two atribute  {question : "" , type : ""}

    clinicIMGs: [{ type: String }],

    patients: [{ type: mongoose.Schema.Types.ObjectId, ref: "Patient" }],

    treatmentPlans: [{ type: mongoose.Schema.Types.ObjectId, ref: "treatmentPlan" }],

    activeChecked: {
        type: String,
        defult: "true"
    },
    feedbacks: [{
        type: Object // comment , rate , date , raterName
    }],
    isApproved: {
        type: String
    }


})

module.exports = doctorModel 