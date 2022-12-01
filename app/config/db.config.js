require("dotenv").config();
module.exports = {
  HOST: process.env.DBHost,
  PORT: process.env.DBPort,
  DB: process.env.DBName
};