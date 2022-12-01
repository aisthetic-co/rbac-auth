const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
require("dotenv").config();

const User = db.user;
const UserRoles = db.userRoles;
const Resource = db.resource;

const { TokenExpiredError } = jwt;

const catchError = (err, res) => {
  if (err instanceof TokenExpiredError) {
    return res.status(401).send({ message: "Unauthorized! Access Token was expired!" });
  }

  return res.sendStatus(401).send({ message: "Unauthorized!" });
}

verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return catchError(err, res);
    }
    req.userId = decoded.id;
    next();
  });
};

async function checkResourceAccess(req, res, next) {
  let verified = 0;
  try {
    const user = await User.findById(req.userId).exec();
    const userRole = await UserRoles.findOne({ userId: user.userId })
      .populate("Role")
      .exec();
    if (!userRole) {
      res
        .status(400)
        .send({ message: "Access Denied! No Access for user in any resource" });
      return;
    }

    const resource = await Resource.findOne({ path: req.route.path }).exec();
    if (!resource) {
      res
        .status(400)
        .send({
          message: "Resource not available to access, contact SuperAdmin",
        });
      return;
    }
    for (let i = 0; i < userRole.Role.length; i++) {
      for (let j = 0; j < resource.permissionsRequired.length; j++) {
        for (let k = 0; k < userRole.Role[i].permissions.length; k++) {
          if (
            userRole.Role[i].permissions[k] == resource.permissionsRequired[j]
          )
            verified = 1;
        }
      }
    }
    if (verified == 0) {
      res
        .status(400)
        .send({
          message:
            "User do not have required permission to access the Resource",
        });
      return;
    }
    next();
  } catch (err) {
    res.status(500).send({ message: err });
    return;
  }
}

checkSuperAdminAccess = (req, res, next) => {
  if (req.userId != process.env.superAdminId) {
    console.log(req.userId);
    res.status(400).send({ message: "Access Denied! Not SuperAdmin" });
    return;
  }
  next();
};

module.exports = {
  verifyToken,
  checkResourceAccess,
  checkSuperAdminAccess,
};
