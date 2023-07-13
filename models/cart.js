const mongoose = require ('mongoose');

const Schema = mongoose.Schema;

const cartSchema = new Schema({
    item_Name: {
        type:String,
        required:true
    },
    item_id:{
        type:String,
        required:true
    },
    quantity:{
        type:String,
        required:true
    },
    price:{
        type:String,
        required:true
    },
    Description:{
        type:String,
        required:true
    }, 
    created_by:{
        type:String,
        required:true
    },
    added_by:{
        type:String,
        required:true
    },
    image:{ 
            data:Buffer,
            contentType:String
    }
}, {timestamps: true});


const Cart = mongoose.model('Cart',cartSchema);

module.exports =Cart;