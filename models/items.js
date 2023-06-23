const mongoose = require ('mongoose');

const Schema = mongoose.Schema;

const itemSchema = new Schema({
    item_Name: {
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
    image:{ 
            data:Buffer,
            contentType:String
    }
}, {timestamps: true});


const Item = mongoose.model('Item',itemSchema);

module.exports =Item;