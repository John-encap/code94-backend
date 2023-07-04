const mongoose = require('mongoose') 

const vendors  = new mongoose.Schema({
    email : {type:String, required: true, unique: true},
    password: {type:String},
    fName:{type:String, required: true},
    lName:{type:String},
    createdAt: {type:Date},
    emailVerified: {type:Boolean, default:false},
    profileImage:{type:String}, 
});

const Vendor = mongoose.model('Vendor',vendors); 

module.exports.Vendor = Vendor; 