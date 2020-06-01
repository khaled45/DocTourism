var mongoose = require('mongoose')

let diagnosisModel = new mongoose.model('Diagnosis', {
    _id: mongoose.Schema.Types.ObjectId,

    MainProblem: {
        type: String,
        required: true
    },
    
    avilableDuration : Object,

    Answers : [{
        type : String
    }] , 

    patientID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true
    },
    doctorID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
        required: true
    }


})




module.exports = diagnosisModel 