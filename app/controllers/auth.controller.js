const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const Role = db.role;
const UserRoles = db.userRoles;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

const defaultUserId = 100;
const defaultIncrement = 1;

exports.signup = (req, res) => {
  User.findOne({}, "userId", { sort: { _id: -1 } }, (err, post) => {
    let userid;
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    try {
      if (post.userId != null) userid = post.userId + defaultIncrement;
      else userid = defaultUserId;
    } catch {
      userid = defaultUserId;
    }
    const user = new User({
      userId: userid,
      username: req.body.username,
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
  });
};

exports.signin = (req, res) => {
  User.findOne({
    username: req.body.username,
  }).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    if (!user) {
      return res.status(404).send({ message: "User Not found." });
    }

    var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);

    if (!passwordIsValid) {
      return res.status(401).send({
        accessToken: null,
        message: "Invalid Password!",
      });
    }
    UserRoles.findOne({ userId: user.userId })
      .populate("Role","name")
      .exec(function (err, userRole) {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
        if (!userRole) {
          res.status(400).send({
            message: "Access Denied! No Access for user in any resource",
          });
          return;
        }

        var token = jwt.sign({ id: user.id }, config.secret, {
          expiresIn: 86400, // 24 hours
        });
    
        res.status(200).send({
          id: user._id,
          username: user.username,
          email: user.email,
          roles: userRole.Role,
          accessToken: token,
        });

      });
    
  });
};
