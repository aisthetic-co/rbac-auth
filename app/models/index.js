const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.user = require("./user.model");
db.role = require("./role.model");
db.userRoles = require("./userRoles.model");
db.resource = require("./resource.model");
db.ROLES = ["admin","user"]
module.exports = db;