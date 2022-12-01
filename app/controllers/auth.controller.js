const config = require("../config/auth.config");
const db = require("../models");
require("dotenv").config();

const User = db.user;
const UserRoles = db.userRoles;
const RefreshToken = db.refreshToken;
const failedLoginAttempt = db.failedLoginAttempt;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

const defaultUserId = process.env.defaultUserId;
const defaultIncrement = process.env.defaultIncrement;

async function signup(req, res) {
  try {
    const post = await User.findOne({}, "userId", { sort: { _id: -1 } });
    let userid;
    try {
      if (post.userId != null) userid = post.userId + defaultIncrement;
      else userid = defaultUserId;
    } catch {
      userid = defaultUserId;
    }
    console.log(userid);
    const user = new User({
      userId: userid,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8),
    });
    user.save((err, userResp) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      res.status(200).send({ message: "User was registered successfully!" });
    });
  } catch (err) {
    res.status(500).send({ message: err });
    return;
  }
}

async function signin(req, res) {
  console.log(req.recaptcha)
  try {
    const user = await User.findOne({
      email: req.body.email,
    }).exec();
    if (!user) {
      return res.status(404).send({ message: "User Not found." });
    }
    if (!user.directLoginAccess) {
      return res.status(404).send({
        message:
          "User don't have the access to login using password, Only Social Login allowed",
      });
    }
    var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
    if (!passwordIsValid) {
      try {
        const pushFailedAttempt = await failedLoginAttempt.updateOne(
          { userId: user.userId, email: user.email },
          { $push: { Attempts: new Date().getTime() } },
          { upsert: true }
        );
      } catch (err) {
        res.status(500).send({ message: err });
        return;
      }
      return res.status(401).send({
        accessToken: null,
        message: "Invalid Password!",
      });
    }
    try {
      const userRole = await UserRoles.findOne({
        userId: user.userId,
      }).populate("Role", "name");
      if (!userRole) {
        res.status(400).send({
          message: "Access Denied! No Access for user in any resource",
        });
        return;
      }

      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: process.env.JWTExpiration, // 24 hours
      });
      let refreshToken = await RefreshToken.createToken(user);
      req.session.refreshToken = refreshToken.token;
      req.session.expiryDate = refreshToken.expiryDate;
      req.session.userId = user._id;
      try {
        const deleteFailedAttempt = await failedLoginAttempt.deleteOne({
          userId: user.userId,
        });
      } catch (err) {}
      res.status(200).send({
        id: user._id,
        email: user.email,
        roles: userRole.Role,
        accessToken: token,
        refreshToken: refreshToken.token,
      });
    } catch (err) {
      res.status(500).send({ message: err });
      return;
    }
  } catch (err) {
    res.status(500).send({ message: err });
    return;
  }
}

async function refreshToken(req, res) {
  const { refreshToken: requestToken } = req.body;

  if (requestToken == null) {
    return res.status(403).json({ message: "Refresh Token is required!" });
  }

  try {
    let refreshToken = await RefreshToken.findOne({ token: requestToken });

    if (!refreshToken) {
      res.status(403).json({ message: "Refresh token is not in database!" });
      return;
    }

    if (RefreshToken.verifyExpiration(refreshToken)) {
      RefreshToken.findByIdAndRemove(refreshToken._id, {
        useFindAndModify: false,
      }).exec();

      res.status(403).json({
        message: "Refresh token was expired. Please make a new signin request",
      });
      return;
    }
    if (
      RefreshToken.verifySession(refreshToken.token, req.session.refreshToken)
    ) {
      res.status(403).json({
        message: "Refresh token invalid with user",
      });
      return;
    }
    let newAccessToken = jwt.sign(
      { id: refreshToken.user._id },
      config.secret,
      {
        expiresIn: config.jwtExpiration,
      }
    );

    return res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: refreshToken.token,
    });
  } catch (err) {
    return res.status(500).send({ message: err });
  }
}
module.exports = { signup, signin, refreshToken };
