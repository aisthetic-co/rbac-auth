const config = require("../config/auth.config");
const db = require("../models");
require("dotenv").config();

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

const Role = db.role;
const Resource = db.resource;
const User = db.user;
const UserRoles = db.userRoles;

exports.signin = (req, res) => {
  if (process.env.superAdminUserName != req.body.username) {
    return res.status(404).send({ message: "Super Admin User Not found." });
  }
  var passwordIsValid = bcrypt.compareSync(
    req.body.password,
    process.env.superAdminPassword
  );
  if (!passwordIsValid) {
    return res.status(401).send({
      accessToken: null,
      message: "Invalid Password!",
    });
  }
  var token = jwt.sign({ id: process.env.superAdminId }, config.secret, {
    expiresIn: 86400, // 24 hours
  });
  res.status(200).send({
    id: process.env.superAdminId,
    username: process.env.superAdminUserName,
    email: process.env.superAdminEmail,
    roles: process.env.superAdminRole,
    accessToken: token,
  });
};

exports.addRole = (req, res) => {
  new Role({
    name: req.body.name,
    permissions: req.body.permissions,
  }).save((err) => {
    if (err) {
      res.status(400).send({ message: err });
      return;
    }
    res.status(200).send({
      status: "success",
      message: "New Role Added Successfully",
    });
  });
};

exports.addResource = (req, res) => {
  new Resource({
    name: req.body.resourceName,
    path: req.body.resourcePath,
    method: req.body.resourceMethod,
    permissionsRequired: req.body.resourcePermissionsRequired,
  }).save((err) => {
    if (err) {
      res.status(400).send({ message: err });
      return;
    }
    res.status(200).send({
      status: "success",
      message: "New Resource Added Successfully",
    });
  });
};

exports.updateUser = (req, res) => {
  User.findOneAndUpdate(
    { username: req.body.username },
    {
      email: req.body.newEmail,
      password: bcrypt.hashSync(req.body.newPassword, 8),
    },
    { new: true },
    (err, post) => {
      if (err) {
        res.status(400).send({ message: err });
        return;
      }
      res.status(200).send({
        status: "success",
        message: "Updated Password & Email: " + post.email,
      });
    }
  );
};

exports.deleteUser = (req, res) => {
  User.findOneAndDelete({ username: req.body.username }, (err, post) => {
    if (err) {
      res.status(400).send({ message: err });
      return;
    }
    res.status(200).send({
      status: "success",
      message: "Deleted User: username: " + req.body.username,
    });
  });
};

exports.addPermissionToUser = (req, res) => {
  User.findOne({ username: req.body.username }, (err, user) => {
    if (err) {
      res.status(400).send({ message: err });
      return;
    }
    if (!user) {
      res.status(400).send({ message: "No user with username" });
      return;
    }
    Role.findOne({ name: req.body.roleName }, (err, role) => {
      if (err) {
        res.status(400).send({ message: err });
        return;
      }
      if (!role) {
        res.status(400).send({ message: "Undefined Role" });
        return;
      }
      UserRoles.updateOne(
        { userId: user.userId },
        { $push: { Role: role._id } },
        { upsert: true },
        (err, userRoles) => {
          if (err) {
            res.status(400).send({ message: err });
            return;
          }
          res.status(200).send({
            status: "success",
            message:
              "Added Role: " +
              req.body.roleName +
              " to the username: req.body.username",
          });
        }
      );
    });
  });
};
