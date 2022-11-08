const db = require("../models");
const ROLES = db.role;
const User = db.user;

checkRolesExisted = (req, res, next) => {
  ROLES.find({}, (err, post) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    let verify = 0;
    if (req.body.roles) {
      for (let i = 0; i < req.body.roles.length; i++) { 
        for (let j = 0; j < post.length; j++) {
          if (post[j].name == req.body.roles[i]) verify = 1;
        }
      }
    }
    if (verify == 0) {
      res.status(400).send({ message: "Undefined Role" });
      return;
    }
    next();
  });
};

const verifySignUp = {
  checkRolesExisted,
};

module.exports = verifySignUp;
