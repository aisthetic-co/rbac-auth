const mongoose = require("mongoose");

const UserRoles = mongoose.model(
  "UserRoles",
  new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.Number,
      required:true,
      unique:true,
      ref: "User",
    },
    Role: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref: "Role",
      },
    ],
  })
);

module.exports = UserRoles;
