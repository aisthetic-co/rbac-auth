const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
require("dotenv").config();

const User = db.user;
const UserRoles = db.userRoles;
const Resource = db.resource;
const RefreshToken = db.refreshToken;

const defaultUserId = process.env.defaultUserId;
const defaultIncrement = process.env.defaultIncrement;

const passport = require("passport");
const FacebookStrategy = require("passport-facebook");

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env["FACEBOOK_APP_ID"],
      clientSecret: process.env["FACEBOOK_APP_SECRET"],
      callbackURL: "http://localhost:8000/api/auth/facebookCallBack",
      profileFields: [
        "id",
        "displayName",
        "email",
        "first_name",
        "middle_name",
        "last_name"
      ],
      scope:["public_profile"]
    },
    async function (accessToken, refreshToken, userData, cb) {
      try {
        let userEmail = userData.emails[0].value;
        const user = await User.findOne({
          email: userEmail,
        }).exec();
        if (!user) {
          //creating user
          try {
            const post = await User.findOne({}, "userId", {
              sort: { _id: -1 },
            });
            let userid;
            try {
              if (post.userId != null) userid = post.userId + defaultIncrement;
              else userid = defaultUserId;
            } catch {
              userid = defaultUserId;
            }
            //console.log(userEmail,userid);
            const user = new User({
              userId: userid,
              email: userEmail,
              directLoginAccess: false,
            });
            user.save((err, userResp) => {
              if (err) {
                res.status(500).send({ message: err });
                return;
              }
              user.id = userResp._id;
            });
          } catch {}
        }
        var token = jwt.sign({ id: user.id }, config.secret, {
          expiresIn: process.env.JWTExpiration, // 24 hours
        });
        let refreshToken = await RefreshToken.createToken(user);
        // req.session.refreshToken = refreshToken.token;
        // req.session.expiryDate = refreshToken.expiryDate;
        // req.session.userId = user._id;
        let signedUserData = {
          id: user._id,
          email: user.email,
          accessToken: token,
          refreshToken: refreshToken.token,
        };
        //console.log(signedUserData)
        return cb(signedUserData);
      } catch {
        console.log(Error);
      }
      return cb("Can't use facebook for authentication, email not verified");
    }
  )
);
passport.serializeUser(function (user, cb) {
  cb(null, user);
});
passport.deserializeUser(function (user, cb) {
  cb(null, user);
});

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
    "/api/auth/facebook",
    passport.authenticate("facebook")
  );
  app.get(
    "/api/auth/facebookCallBack",
    passport.authenticate("facebook", {
      failureRedirect: "/loginfailed",
      successRedirect: "/login",
    },async function(data){
      console.log("call back fb:",data);
    })
  );
  app.get(
    "/login",async function(req,res){
      //console.log("call back fb:",req.userData);
    });
};
