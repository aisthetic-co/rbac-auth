const mongoose = require("mongoose");

const Resource = mongoose.model(
  "Resource",
  new mongoose.Schema({
    name: {
      type: String,
      required:true,
      unique:true,
    },
    path:{
      type: String,
      required:true,
      unique:true,
    },
    method: {
      type: String,
      required:true,
    },
    permissionsRequired: {
      type: Array,
    }
  })
);

module.exports = Resource;
