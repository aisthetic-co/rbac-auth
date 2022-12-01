const db = require("../models");
const moment = require("moment");
require("dotenv").config();
const failedLoginAttempt = db.failedLoginAttempt;
const User = db.user;
const maxFailedLoginAttempts = process.env.maxFailedLoginAttempts;
const maxFailedLoginAttempts_Time = process.env.maxFailedLoginAttempts_Time;

loginattempts = async function (req, res, next) {
  const time = moment(new Date());
  try {
    const failedData = await failedLoginAttempt
      .findOne({ email: req.body.email })
      .exec();
    if (failedData.Attempts.length > maxFailedLoginAttempts-1) {
      const timeDiff = moment
        .duration(time)
        .subtract(
          moment.duration(
            failedData.Attempts[
              failedData.Attempts.length - 1
            ]
          )
        )
        .as("minutes");
      if (timeDiff < maxFailedLoginAttempts_Time) {
        return res.status(401).send({ message: "Too much login attempts, try after " + (maxFailedLoginAttempts_Time - timeDiff)+ " mins."});
      }
    }
    next();
  } catch (err) {
    next();
  } 
};

const checkBruteForce = {
  loginattempts,
};

module.exports = checkBruteForce;
