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
const GoogleStrategy = require("passport-google-oauth20");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env["GOOGLE_CLIENT_ID"],
      clientSecret: process.env["GOOGLE_CLIENT_SECRET"],
      callbackURL: "/api/auth/googleCallBack",
      scope: ["email", "profile"],
      state: true,
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
      } catch {}
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

  app.get("/api/auth/google", passport.authenticate("google"));
  app.get(
    "/api/auth/googleCallBack",
    passport.authenticate(
      "google",
      {
        failureRedirect: "/api/auth/failure",
      },
      function (data) {
        console.log("callback:", data);
      }
    )
  );
  app.get("/api/auth/failure", (req, res) => {
    res.send("something went wrong");
  });
};
