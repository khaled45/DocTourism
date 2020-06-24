var mongoose = require('mongoose')
const { object } = require('joi')

let diagnosisModel = new mongoose.model('Diagnosis', {
    _id: mongoose.Schema.Types.ObjectId,

    MainProblem: {
        type: Object
    },

    avilableDuration: Object,

    doctorQuesAns: {
        type: Object
    },

    medicalHistory: {
        type: Object
    },

    patientID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true
    },
    doctorID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
        required: true
    },

    createdDate: {
        type: Object
    }

})




module.exports = diagnosisModel