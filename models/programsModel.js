var mongoose = require('mongoose')
const { required, string } = require('joi')

let programsModel = new mongoose.model('programs', {
    _id: mongoose.Schema.Types.ObjectId,
    title: {
        type: String,
        max: 50
    },
    itinerary: [{
        type: Object
    }],
    included: [{
        type: String
    }],
    excluded: [{
        type: String
    }],
    catygory: {
        type: String
    },
    cost: {
        type: Object
    },
    numberOfDays: {
        type: Number
    },
    IMG: {
        type: String
    },
    location: {
        type: String
    },
    travelAgentID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'travelAgent'
    },
    touristID: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient'
    }]

})
module.exports = programsModel


