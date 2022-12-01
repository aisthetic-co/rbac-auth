require("dotenv").config();
module.exports = {
  secret: process.env.KEY,
  jwtExpiration: process.env.JWTExpiration,          
  jwtRefreshExpiration: process.env.JWTRefreshExpiration,  
};
