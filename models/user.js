const mongoose = require ('mongoose');

const Schema = mongoose.Schema;

let bcrypt =require('bcrypt');

const userSchema = new Schema({
    first_name: {
        type:String,
        required:true
    },
    last_name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }, 
    usergenerated_id:{
        type:String,
        required:true
    },
    activated:{
        type:Boolean,
        default:0
    }
}, {timestamps: true});


// hash the password
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
  };

  // checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
  };

const User = mongoose.model('User',userSchema);

module.exports =User;