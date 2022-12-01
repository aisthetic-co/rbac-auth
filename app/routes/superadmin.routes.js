const { authJwt } = require("../middlewares");
const controller = require("../controllers/superadmin.controller");
const authcontroller = require("../controllers/auth.controller");
module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/admin/signin", controller.signin);
  app.post("/api/admin/addRole", [authJwt.verifyToken,authJwt.checkSuperAdminAccess], controller.addRole);
  app.post("/api/admin/addRoleToUser", [authJwt.verifyToken,authJwt.checkSuperAdminAccess], controller.addRoleToUser);
  app.post("/api/admin/addResource", [authJwt.verifyToken,authJwt.checkSuperAdminAccess], controller.addResource);
  app.post("/api/admin/addUser", [authJwt.verifyToken,authJwt.checkSuperAdminAccess], authcontroller.signup);
  app.post("/api/admin/deleteUser", [authJwt.verifyToken,authJwt.checkSuperAdminAccess], controller.deleteUser);
  app.post("/api/admin/updateUser", [authJwt.verifyToken,authJwt.checkSuperAdminAccess], controller.updateUser);
};
