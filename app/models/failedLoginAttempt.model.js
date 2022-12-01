const mongoose = require("mongoose");

const failedLoginAttempt = mongoose.model(
  "failedLoginAttempt",
  new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.Number,
      required: true,
      unique: true,
      ref: "User",
    },
    email: {
        type: String,
        required: true,
        unique: true,
        ref: "User",
      },
    Attempts: [
      {
        type: Date,
      },
    ],
  })
);

module.exports = failedLoginAttempt;
