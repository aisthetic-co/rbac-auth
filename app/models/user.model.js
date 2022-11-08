const mongoose = require("mongoose");
const validator = require("validator");

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    userId: {
      type: Number,
      required:true,
      unique:true,
    },
    username: {
      type: String,
      required:true,
      unique:true,
    },
    email: {
      type: String,
      required:true,
      unique:true,
      validate(value){
        if(!validator.isEmail(value))throw new Error('Email is Invalid');
      }
    },
    password: {
      type: String,
      required:true,
    },
  })
);

module.exports = User;
