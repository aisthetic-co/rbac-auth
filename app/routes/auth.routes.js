require("dotenv").config();
const { verifySignUp, checkBruteForce } = require("../middlewares");
const controller = require("../controllers/auth.controller");
var Recaptcha = require("express-recaptcha").RecaptchaV3;
var recaptcha = new Recaptcha(
  process.env.CAPTCHA_SITE_KEY,
  process.env.CAPTCHA_SECRET_KEY
);

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });
  app.get("/login", (req, res) => {
    res.send(
      "<script src='https://www.google.com/recaptcha/api.js'></script><form action='/api/auth/signin' method='post'><input type='text' name='email'><br><input type='password' name='password'><br><button class='g-recaptcha' data-sitekey='" +process.env.CAPTCHA_SITE_KEY+ "'data-callback='onSubmit' data-action='submit'>Submit</button><br><a href='/api/auth/google'>Authenticate with Google</a> <br> <a href='/api/auth/facebook'>Authenticate with Facebook</a>"
    );
  });
  app.post("/api/auth/signup", controller.signup);
  app.post("/api/auth/refreshtoken", controller.refreshToken);
  app.post(
    "/api/auth/signin",
    [recaptcha.middleware.verify, checkBruteForce.loginattempts],
    controller.signin
  );
};
