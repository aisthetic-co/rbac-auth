const express = require("express");
const cors = require("cors");
const dbConfig = require("./app/config/db.config");

const app = express();

var corsOptions = {
  origin: "http://localhost:8081",
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

const db = require("./app/models");

//For Dummy Data 
const Role = db.role;
const UserRoles = db.userRoles;
const Resource = db.resource;

db.mongoose
  .connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Successfully connect to MongoDB.");
    initial();//Comment to Skip Dummy Data Insertion
  })
  .catch((err) => {
    console.error("Connection error", err);
    process.exit();
  });

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to aisthetic" });
});

// routes
require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);
require("./app/routes/superadmin.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

function initial() {
  Resource.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      new Resource({
        name: "test",
        path: "/api/test/user",
        method:"GET",
        permissionsRequired: ["read:test"],
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }
        console.log("added 'Test' to Resources collection");
      });
    }
  });
  UserRoles.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      new UserRoles({
        userId: 0,
        Role: [db.mongoose.Types.ObjectId("63675d8388916ff85f407cd7"),db.mongoose.Types.ObjectId("63675d8388916ff85f407cd8")],
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }
        console.log("added role to UserRoles collection");
      });
    }
  });
  Role.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      new Role({
        name: "admin",
        permissions: ["read:admin"],
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }
        console.log("added 'admin' to roles collection");
      });

      new Role({
        name: "user",
        permissions: ["read:user"],
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }
        console.log("added 'user' to roles collection");
      });
    }
  });
}
