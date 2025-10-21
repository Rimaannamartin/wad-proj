const mongoose = require('mongoose');

const newUser = new mongoose.Schema({

  name: {
    type: String,
    required: [true, "username is required"]
  },

  password: {
    type: String, 
    required: [true, "password is required"]
  },

  confirmPassword: {
    type: String,
    required: [true, "confirm password is required"]
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^[a-zA-Z0-9._%+-]+@gmail\.com$/, "Please enter a valid Gmail address"]
  },

  otp: {
    type:String,
    required: [false, "otp is required"]
  },

  otpExpiery:{

    type:Date


  },



  isVerified: { type: Boolean, default: false },
    

  

});

module.exports = mongoose.model('User', newUser);
