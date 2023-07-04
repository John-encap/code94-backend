const mongoose = require('mongoose') 

const products  = new mongoose.Schema({
    sku: {type:String, required: true, unique: true}, 
    quantity: {type:Number, default:0}, 
    name:{type:String,required:true}, 
    description: {type:String}, 
    images: [{ type: String }],
});


const Product = mongoose.model('Product',products); 

module.exports.Product = Product; 