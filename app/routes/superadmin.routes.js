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
  app.get("/api/admin/addRole", [authJwt.verifyToken,authJwt.checkSuperAdminAccess], controller.addRole);
  app.get("/api/admin/addPermissionToUser", [authJwt.verifyToken,authJwt.checkSuperAdminAccess], controller.addPermissionToUser);
  app.get("/api/admin/addResource", [authJwt.verifyToken,authJwt.checkSuperAdminAccess], controller.addResource);
  app.get("/api/admin/addUser", [authJwt.verifyToken,authJwt.checkSuperAdminAccess], authcontroller.signup);
  app.get("/api/admin/deleteUser", [authJwt.verifyToken,authJwt.checkSuperAdminAccess], controller.deleteUser);
  app.get("/api/admin/updateUser", [authJwt.verifyToken,authJwt.checkSuperAdminAccess], controller.updateUser);
};
