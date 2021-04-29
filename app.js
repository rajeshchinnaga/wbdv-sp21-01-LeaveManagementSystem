var express = require("express"),
  app = express(),
  mongoose = require("mongoose"),
  expressvalidator = require("express-validator"),
  session = require("express-session"),
  methodOverride = require("method-override"),
  bodyparser = require("body-parser"),
  passport = require("passport"),
  LocalStrategy = require("passport-local").Strategy,
  passportLocalMongoose = require("passport-local-mongoose"),
  flash = require("connect-flash"),
  Employee = require("./models/employee"),
  Hr = require("./models/hr"),
  Manager = require("./models/manager"),
  Leave = require("./models/leave");

var moment = require("moment");
var axios = require("axios").default;

var url =process.env.DATABASEURL|| "mongodb+srv://Admin:admin@leavemanagementsystem.up08i.mongodb.net/LeaveManagementSystem?retryWrites=true&w=majority";
mongoose
  .connect(url, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => {
    console.log("connected to DB");
  })
  .catch(err => {
    console.log("Error:", err.message);
  });

app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(expressvalidator());

//passport config
app.use(
  require("express-session")({
    secret: "secret",
    resave: false,
    saveUninitialized: false
  })
);
app.use(passport.initialize());
app.use(passport.session());
// passport.use(new LocalStrategy(Employee.authenticate()));
// passport.use(
//   new LocalStrategy(function(username, password, done) {
//     User.findOne({ username: username }, function(err, user) {
//       if (err) {
//         return done(err);
//       }
//       if (!user) {
//         return done(null, false);
//       }
//       if (!user.verifyPassword(password)) {
//         return done(null, false);
//       }
//       return done(null, user);
//     });
//   })
// );

// passport.serializeUser(Employee.serializeUser());
// passport.deserializeUser(Employee.deserializeUser());
// app.use(
//   expressvalidator({
//     errorFormatter: function(param, msg, value) {
//       var namespace = param.split("."),
//         root = namespace.shift(),
//         formParam = root;

//       while (namespace.length) {
//         formParam += "[" + namespace.shift() + "]";
//       }
//       return {
//         param: formParam,
//         msg: msg,
//         value: value
//       };
//     }
//   })
// );
app.use(flash());
app.use((req, res, next) => {
  //   res.locals.currentUser = req.user;
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  res.locals.user = req.user || null;
  next();
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash("error", "You need to be logged in");
    res.redirect("/employee/login");
  }
}
app.get("/", (req, res) => {
  res.render("home");
});


var options = {
  method: 'GET',
  url: 'https://generate-people.p.rapidapi.com/generatepeople',
  headers: {
    'x-rapidapi-key': '0e3f246e14msh1441f9d5a1ed78cp13713djsnf9afcbb5832f',
    'x-rapidapi-host': 'generate-people.p.rapidapi.com'
  }
};

app.get("/posts", (req, res) => {
  axios
      .get(options)
      .then(function (result) {
        res.render("posts", {
          items: result.data
        });
      })
      .catch(function (error) {
        // handle errors appropriately
        res.render("error", { error });
      });
});



//login logic for Employee

//login logic for Manager

// passport.serializeUser(function(manager, done) {
//   done(null, manager.id);
// });

// passport.deserializeUser(function(id, done) {

// });

//registration form
app.get("/contact", (req, res) => {
  res.render("contactUs");
});
app.get("/aboutUs", (req, res) => {
  res.render("aboutUs");
});

app.get("/register", (req, res) => {
  res.render("register");
});
//registration logic
app.post("/employee/register", (req, res) => {
  var type = req.body.type;
  if (type == "employee") {
    var name = req.body.name;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;
    var designation = req.body.designation;
    var project = req.body.project;
    var image = req.body.image;
    //validation
    req.checkBody("name", "name is required").notEmpty();
    req.checkBody("username", "Username is required").notEmpty();
    req.checkBody("designation", "hostel is required").notEmpty();
    req.checkBody("project", "department is required").notEmpty();
    req.checkBody("password", "Password is required").notEmpty();
    req.checkBody("password2", "Password dont match").equals(req.body.password);

    var errors = req.validationErrors();
    if (errors) {
      // req.session.errors = errors;
      // req.session.success = false;
      console.log("errors: " + errors);
      res.render("register", {
        errors: errors
      });
    } else {
      var newEmployee = new Employee({
        name: name,
        username: username,
        password: password,
        project: project,
        designation: designation,
        type: type,
        image: image
      });
      Employee.createEmployee(newEmployee, (err, employee) => {
        if (err) throw err;
        console.log(employee);
      });
      req.flash("success", "you are registered successfully,now you can login");

      res.redirect("/employee/login");
    }
  } else if (type == "manager") {
    var name = req.body.name;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;
    var project = req.body.project;
    var image = req.body.image;

    req.checkBody("name", "Name is required").notEmpty();
    req.checkBody("username", "Username is required").notEmpty();
    req.checkBody("password", "password is required").notEmpty();
    req.checkBody("project", "project is required").notEmpty();
    req.checkBody("password2", "Password dont match").equals(req.body.password);

    var errors = req.validationErrors();
    if (errors) {
      res.render("register", {
        errors: errors
      });
    } else {
      var newManager = new Manager({
        name: name,
        username: username,
        password: password,
        project: project,
        type: type,
        image: image
      });
      Manager.createManager(newManager, (err, manager) => {
        if (err) throw err;
        console.log(manager);
      });
      req.flash("success", "you are registered successfully,now you can login");

      res.redirect("/manager/login");
    }
  } else if (type == "hr") {
    var name = req.body.name;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;
    var designation = req.body.designation;
    var image = req.body.image;

    req.checkBody("name", "Name is required").notEmpty();
    req.checkBody("username", "Username is required").notEmpty();
    req.checkBody("password", "password is required").notEmpty();
    req.checkBody("designation", "hostel is required").notEmpty();
    req.checkBody("password2", "Password dont match").equals(req.body.password);

    var errors = req.validationErrors();
    if (errors) {
      res.render("register", {
        errors: errors
      });
    } else {
      var newHr = new Hr({
        name: name,
        username: username,
        password: password,
        designation: designation,
        type: type,
        image: image
      });
      Hr.createHr(newHr, (err, hr) => {
        if (err) throw err;
        console.log(hr);
      });
      req.flash("success", "you are registered successfully,now you can login");

      res.redirect("/hr/login");
    }
  }
});

//stratergies
passport.use(
  "employee",
  new LocalStrategy((username, password, done) => {
    Employee.getUserByUsername(username, (err, employee) => {
      if (err) throw err;
      if (!employee) {
        return done(null, false, { message: "Unknown User" });
      }
      Employee.comparePassword(
        password,
          employee.password,
        (err, passwordFound) => {
          if (err) throw err;
          if (passwordFound) {
            return done(null, employee);
          } else {
            return done(null, false, { message: "Invalid Password" });
          }
        }
      );
    });
  })
);

passport.use(
  "manager",
  new LocalStrategy((username, password, done) => {
    Manager.getUserByUsername(username, (err, manager) => {
      if (err) throw err;
      if (!manager) {
        return done(null, false, { message: "Unknown User" });
      }
      Manager.comparePassword(password, manager.password, (err, passwordFound) => {
        if (err) throw err;
        if (passwordFound) {
          return done(null, manager);
        } else {
          return done(null, false, { message: "Invalid Password" });
        }
      });
    });
  })
);

passport.use(
  "hr",
  new LocalStrategy((username, password, done) => {
    Hr.getUserByUsername(username, (err, hr) => {
      if (err) throw err;
      if (!hr) {
        return done(null, false, { message: "Unknown User" });
      }
      Hr.comparePassword(
        password,
        hr.password,
        (err, passwordFound) => {
          if (err) throw err;
          if (passwordFound) {
            return done(null, hr);
          } else {
            return done(null, false, { message: "Invalid Password" });
          }
        }
      );
    });
  })
);

//srialize

passport.serializeUser(function(user, done) {
  // console.log(user.id);
  done(null, { id: user.id, type: user.type });
});

//deserialize

passport.deserializeUser(function(obj, done) {
  switch (obj.type) {
    case "employee":
      Employee.getUserById(obj.id, function(err, employee) {
        done(err, employee);
      });
      break;
    case "manager":
      Manager.getUserById(obj.id, function(err, manager) {
        done(err, manager);
      });
      break;
    case "hr":
      Hr.getUserById(obj.id, function(err, hr) {
        done(err, hr);
      });
      break;
    default:
      done(new Error("no entity type:", obj.type), null);
      break;
  }
});

app.get("/employee/login", (req, res) => {
  res.render("login");
});

app.post(
  "/employee/login",
  passport.authenticate("employee", {
    successRedirect: "/employee/home",
    failureRedirect: "/employee/login",
    failureFlash: true
  }),
  (req, res) => {
    // console.log(employee);
    res.redirect("/employee/home");
  }
);

app.get("/employee/home", ensureAuthenticated, (req, res) => {
  var employee = req.user.username;
  console.log(employee);
  Employee.findOne({ username: req.user.username })
    .populate("leaves")
    .exec((err, employee) => {
      if (err || !employee) {
        req.flash("error", "Employee not found");
        res.redirect("back");
        console.log("err");
      } else {
        res.render("homeemployee", {
          employee: employee,
          moment: moment
        });
      }
    });
});
app.get("/employee/contact", ensureAuthenticated, (req, res) => {
  var employee = req.user.username;
  console.log(employee);
  Employee.findOne({ username: req.user.username })
      .populate("leaves")
      .exec((err, employee) => {
        if (err || !employee) {
          req.flash("error", "Employee not found");
          res.redirect("back");
          console.log("err");
        } else {
          res.render("contactEmployee", {
            employee: employee,
            moment: moment
          });
        }
      });
});
app.get("/employee/aboutus", ensureAuthenticated, (req, res) => {
  var employee = req.user.username;
  console.log(employee);
  Employee.findOne({ username: req.user.username })
      .populate("leaves")
      .exec((err, employee) => {
        if (err || !employee) {
          req.flash("error", "Employee not found");
          res.redirect("back");
          console.log("err");
        } else {
          res.render("aboutUsEmployee", {
            employee: employee,
            moment: moment
          });
        }
      });
});
app.get("/employee/:id", ensureAuthenticated, (req, res) => {
  console.log(req.params.id);
  Employee.findById(req.params.id)
    .populate("leaves")
    .exec((err, foundEmployee) => {
      if (err || !foundEmployee) {
        req.flash("error", "Employee not found");
        res.redirect("back");
      } else {
        res.render("profileemployee", { employee: foundEmployee });
      }
    });
});
app.get("/employee/:id/edit", ensureAuthenticated, (req, res) => {
  Employee.findById(req.params.id, (err, foundEmployee) => {
    res.render("editEmployee", { employee: foundEmployee });
  });
});




app.put("/employee/:id", ensureAuthenticated, (req, res) => {
  console.log(req.body.employee);
  Employee.findByIdAndUpdate(
    req.params.id,
    req.body.employee,
    (err, updatedEmployee) => {
      if (err) {
        req.flash("error", err.message);
        res.redirect("back");
      } else {
        req.flash("success", "Succesfully updated");
        res.redirect("/employee/" + req.params.id);
      }
    }
  );
});



app.get("/employee/:id/apply", ensureAuthenticated, (req, res) => {
  Employee.findById(req.params.id, (err, foundEmployee) => {
    if (err) {
      console.log(err);
      res.redirect("back");
    } else {
      res.render("leaveApplyEmployee", { employee: foundEmployee });
    }
  });
});

app.post("/employee/:id/apply", (req, res) => {
  Employee.findById(req.params.id)
    .populate("leaves")
    .exec((err, employee) => {
      if (err) {
        res.redirect("/employee/home");
      } else {
        date = new Date(req.body.leave.from);
        todate = new Date(req.body.leave.to);
        year = date.getFullYear();
        month = date.getMonth() + 1;
        dt = date.getDate();
        todt = todate.getDate();

        if (dt < 10) {
          dt = "0" + dt;
        }
        if (month < 10) {
          month = "0" + month;
        }
        console.log(todt - dt);
        req.body.leave.days = todt - dt + 1;
        console.log(year + "-" + month + "-" + dt);
        // req.body.leave.to = req.body.leave.to.substring(0, 10);
        console.log(req.body.leave);
        // var from = new Date(req.body.leave.from);
        // from.toISOString().substring(0, 10);
        // console.log("from date:", strDate);
        Leave.create(req.body.leave, (err, newLeave) => {
          if (err) {
            req.flash("error", "Something went wrong");
            res.redirect("back");
            console.log(err);
          } else {
            newLeave.employee.id = req.user._id;
            newLeave.employee.username = req.user.username;
            console.log("leave is applied by--" + req.user.username);

            // console.log(newLeave.from);
            newLeave.save();

            employee.leaves.push(newLeave);

            employee.save();
            req.flash("success", "Successfully applied for leave");
            res.render("homeemployee", { employee: employee, moment: moment });
          }
        });
      }
    });
});
app.get("/employee/:id/track", (req, res) => {
  Employee.findById(req.params.id)
    .populate("leaves")
    .exec((err, foundEmployee) => {
      if (err) {
        req.flash("error", "No employee with requested id");
        res.redirect("back");
      } else {
        res.render("trackLeaveEmployee", { employee: foundEmployee, moment: moment });
      }
    });
});

app.get("/employee/:id/track/:leave_id/edit", (req, res) => {
  Employee.findById(req.params.id).exec((err, employeeFound) => {
    if (err) {
      req.flash("error", "Employee not found with requested id");
      res.redirect("back");
    } else {
      Leave.findById(req.params.leave_id)
         .exec((err, foundLeave) => {
           var fromDate = moment(foundLeave.from).utc().format("YYYY-MM-DD");
           var toDate = moment(foundLeave.to).utc().format("YYYY-MM-DD");
            if (err) {
              req.flash("error", "Leave not found with this id");
              res.redirect("back");
            } else {
              res.render("editLeaveEmployee", {
                leave: foundLeave,
                employee: employeeFound,
                from: fromDate,
                to: toDate,
                moment: moment
              });
            }
          });
    }
  });
});

app.put("/employee/:id/track/:leave_id", (req, res) => {
  Employee.findById(req.params.id).exec((err, foundemployee) => {
    if (err) {
      req.flash("error", "Employee not found with requested id");
      res.redirect("back");
    } else{
      date = new Date(req.body.leave.from);
    todate = new Date(req.body.leave.to);
    year = date.getFullYear();
    month = date.getMonth() + 1;
    dt = date.getDate();
    todt = todate.getDate();

    if (dt < 10) {
      dt = "0" + dt;
    }
    if (month < 10) {
      month = "0" + month;
    }
    console.log(todt - dt);
    req.body.leave.days = todt - dt + 1;
    console.log(year + "-" + month + "-" + dt);
    // req.body.leave.to = req.body.leave.to.substring(0, 10);
    console.log(req.body.leave);
    // var from = new Date(req.body.leave.from);
    // from.toISOString().substring(0, 10);
    // console.log("from date:", strDate);
      Leave.findByIdAndUpdate(
          {_id: req.params.leave_id},
          { $set: req.body.leave },
          (err, updatedLeave) => {
            console.log(updatedLeave);
            if (err) {
              req.flash("error", err.message);
              res.redirect("back");
            } else {

              // console.log(newLeave.from);
              console.log(updatedLeave);
              // updatedLeave.save();
              //
              // foundemployee.leaves.push(updatedLeave);
              //
              // foundemployee.save();

              req.flash("success", "Succesfully Updated");
              res.redirect("/employee/" + req.params.id);
            }
          }
      );
    }
  });
});

app.get('/employee/:id/track/:id/delete', function(req, res){
  Leave.findByIdAndRemove({_id: req.params.id},
      function(err, leave){
        if(err) {
          res.json(err);
        }
        else  {
          console.log(leave);
          req.flash("success", "Succesfully Deleted");
          res.redirect("back");
        }
      });
});



app.get("/manager/login", (req, res) => {
  res.render("managerlogin");
});

app.post(
  "/manager/login",
  passport.authenticate("manager", {
    successRedirect: "/manager/home",
    failureRedirect: "/manager/login",
    failureFlash: true
  }),
  (req, res) => {
    res.redirect("/manager/home");
  }
);

app.get("/manager/home", ensureAuthenticated, (req, res) => {
  var manager = req.user.username;
  console.log(manager);
  Manager.findOne({ username: req.user.username })
      .populate("leaves")
      .exec((err, manager) => {
        if (err || !manager) {
          req.flash("error", "Manager not found");
          res.redirect("back");
          console.log("err");
        } else {
          res.render("homemanager", {
            manager: manager,
            moment: moment
          });
        }
      });
});

app.get("/manager/contact", ensureAuthenticated, (req, res) => {
  var manager = req.user.username;
  console.log(manager);
  Manager.findOne({ username: req.user.username })
      .populate("leaves")
      .exec((err, manager) => {
        if (err || !manager) {
          req.flash("error", "Manager not found");
          res.redirect("back");
          console.log("err");
        } else {
          res.render("contactManager", {
            manager: manager,
            moment: moment
          });
        }
      });
});
app.get("/manager/aboutus", ensureAuthenticated, (req, res) => {
  var manager = req.user.username;
  console.log(manager);
  Manager.findOne({ username: req.user.username })
      .populate("leaves")
      .exec((err, employee) => {
        if (err || !employee) {
          req.flash("error", "Manager not found");
          res.redirect("back");
          console.log("err");
        } else {
          res.render("aboutUsManager", {
            manager: manager,
            moment: moment
          });
        }
      });
});
app.get("/manager/:id", ensureAuthenticated, (req, res) => {
  console.log(req.params.id);
  Manager.findById(req.params.id).exec((err, foundManager) => {
    if (err || !foundManager) {
      req.flash("error", "Manager not found");
      res.redirect("back");
    } else {
      res.render("profilemanager", { manager: foundManager });
    }
  });
});

app.get("/manager/:id/apply", ensureAuthenticated, (req, res) => {
  Manager.findById(req.params.id, (err, foundManager) => {
    if (err) {
      console.log(err);
      res.redirect("back");
    } else {
      res.render("leaveApplyManager", { manager: foundManager });
    }
  });
});

app.post("/manager/:id/apply", (req, res) => {
  Manager.findById(req.params.id)
      .populate("leaves")
      .exec((err, manager) => {
        if (err) {
          res.redirect("/manager/home");
        } else {
          date = new Date(req.body.leave.from);
          todate = new Date(req.body.leave.to);
          year = date.getFullYear();
          month = date.getMonth() + 1;
          dt = date.getDate();
          todt = todate.getDate();

          if (dt < 10) {
            dt = "0" + dt;
          }
          if (month < 10) {
            month = "0" + month;
          }
          console.log(todt - dt);
          req.body.leave.days = todt - dt + 1;
          console.log(year + "-" + month + "-" + dt);
          // req.body.leave.to = req.body.leave.to.substring(0, 10);
          console.log(req.body.leave);
          // var from = new Date(req.body.leave.from);
          // from.toISOString().substring(0, 10);
          // console.log("from date:", strDate);
          Leave.create(req.body.leave, (err, newLeave) => {
            if (err) {
              req.flash("error", "Something went wrong");
              res.redirect("back");
              console.log(err);
            } else {
              newLeave.manager.id = req.user._id;
              newLeave.manager.username = req.user.username;
              console.log("leave is applied by--" + req.user.username);

              // console.log(newLeave.from);
              newLeave.save();

              manager.leaves.push(newLeave);

              manager.save();
              req.flash("success", "Successfully applied for leave");
              res.render("homemanager", { manager: manager, moment: moment });
            }
          });
        }
      });
});

app.get("/manager/:id/track", (req, res) => {
  Manager.findById(req.params.id)
      .populate("leaves")
      .exec((err, foundManager) => {
        if (err) {
          req.flash("error", "No manager with requested id");
          res.redirect("back");
        } else {
          res.render("trackLeaveManager", { manager: foundManager, moment: moment });
        }
      });
});

app.get("/manager/:id/track/:leave_id/edit", (req, res) => {
  Manager.findById(req.params.id).exec((err, managerFound) => {
    if (err) {
      req.flash("error", "Manager not found with requested id");
      res.redirect("back");
    } else {
      Leave.findById(req.params.leave_id)
          .exec((err, foundLeave) => {
            var fromDate = moment(foundLeave.from).utc().format("YYYY-MM-DD");
            var toDate = moment(foundLeave.to).utc().format("YYYY-MM-DD");
            if (err) {
              req.flash("error", "Leave not found with this id");
              res.redirect("back");
            } else {
              res.render("editLeaveManager", {
                leave: foundLeave,
                manager: managerFound,
                from: fromDate,
                to: toDate,
                moment: moment
              });
            }
          });
    }
  });
});

app.put("/manager/:id/track/:leave_id", (req, res) => {
  Manager.findById(req.params.id).exec((err, foundManager) => {
    if (err) {
      req.flash("error", "Manager not found with requested id");
      res.redirect("back");
    } else{
      date = new Date(req.body.leave.from);
      todate = new Date(req.body.leave.to);
      year = date.getFullYear();
      month = date.getMonth() + 1;
      dt = date.getDate();
      todt = todate.getDate();

      if (dt < 10) {
        dt = "0" + dt;
      }
      if (month < 10) {
        month = "0" + month;
      }
      console.log(todt - dt);
      req.body.leave.days = todt - dt + 1;
      console.log(year + "-" + month + "-" + dt);
      // req.body.leave.to = req.body.leave.to.substring(0, 10);
      console.log(req.body.leave);
      // var from = new Date(req.body.leave.from);
      // from.toISOString().substring(0, 10);
      // console.log("from date:", strDate);
      Leave.findByIdAndUpdate(
          {_id: req.params.leave_id},
          { $set: req.body.leave },
          (err, updatedLeave) => {
            console.log(updatedLeave);
            if (err) {
              req.flash("error", err.message);
              res.redirect("back");
            } else {

              // console.log(newLeave.from);
              console.log(updatedLeave);
              // updatedLeave.save();
              //
              // foundemployee.leaves.push(updatedLeave);
              //
              // foundemployee.save();

              req.flash("success", "Succesfully Updated");
              res.redirect("/manager/" + req.params.id);
            }
          }
      );
    }
  });
});

app.get('/manager/:id/track/:id/delete', function(req, res){
  Leave.findByIdAndRemove({_id: req.params.id},
      function(err, leave){
        if(err) {
          res.json(err);
        }
        else  {
          console.log(leave);
          req.flash("success", "Succesfully Deleted");
          res.redirect("back");
        }
      });
});

app.get("/manager/:id/edit", ensureAuthenticated, (req, res) => {
  Manager.findById(req.params.id, (err, foundManager) => {
    res.render("editManager", { manager: foundManager });
  });
});
app.put("/manager/:id", ensureAuthenticated, (req, res) => {
  console.log(req.body.manager);
  Manager.findByIdAndUpdate(req.params.id, req.body.manager, (err, updatedManager) => {
    if (err) {
      req.flash("error", err.message);
      res.redirect("back");
    } else {
      req.flash("success", "Succesfully updated");
      res.redirect("/manager/" + req.params.id);
    }
  });
});
app.get("/manager/:id/leave", (req, res) => {
  Manager.findById(req.params.id).exec((err, managerFound) => {
    if (err) {
      req.flash("error", "Manager not found with requested id");
      res.redirect("back");
    } else {
      // console.log(managerFound);
      Employee.find({ project: managerFound.project })
        .populate("leaves")
        .exec((err, employees) => {
          if (err) {
            req.flash("error", "Employee not found with your department");
            res.redirect("back");
          } else {
            // employees.forEach(function(employee) {
            //   if (employee.leaves.length > 0) {
            // employee.leaves.forEach(function(leave) {
            //   console.log(leave);
            //   console.log("////////////");
            // Leave.findById(leave, (err, leaveFound) => {
            //   if (err) {
            //     req.flash("error", "leave not found");
            //     res.redirect("back");
            //   } else {
            //     // console.log(leaveFound.subject);
            res.render("managerLeaveSign", {
              manager: managerFound,
              employees: employees,
              // leave: leaveFound,
              moment: moment
            });
            //   }
            // });
            // });
            // }
            // Leave.find({ username: employee.username }, (err, leave) => {
            //   console.log(leave.username);
            // });
            // });
            // console.log(employees);
          }
        });
    }
    // console.log(req.body.manager);
  });
});

app.get("/manager/:id/leave/:employee_id/info", (req, res) => {
  Manager.findById(req.params.id).exec((err, managerFound) => {
    if (err) {
      req.flash("error", "Manager not found with requested id");
      res.redirect("back");
    } else {
      Employee.findById(req.params.employee_id)
        .populate("leaves")
        .exec((err, foundEmployee) => {
          if (err) {
            req.flash("error", "Employee not found with this id");
            res.redirect("back");
          } else {
            res.render("moreinfoemployee", {
              employee: foundEmployee,
              manager: managerFound,
              moment: moment
            });
          }
        });
    }
  });
});

app.post("/manager/:id/leave/:employee_id/info", (req, res) => {
  Manager.findById(req.params.id).exec((err, managerFound) => {
    if (err) {
      req.flash("error", "Manager not found with requested id");
      res.redirect("back");
    } else {
      Employee.findById(req.params.employee_id)
        .populate("leaves")
        .exec((err, foundEmployee) => {
          if (err) {
            req.flash("error", "Employee not found with this id");
            res.redirect("back");
          } else {
            if (req.body.action === "Approve") {
              foundEmployee.leaves.forEach(function(leave) {
                if (leave.status === "pending") {
                  leave.status = "approved";
                  leave.approved = true;
                  leave.save();
                }
              });
            } else {
              console.log("u denied");
              foundEmployee.leaves.forEach(function(leave) {
                if (leave.status === "pending") {
                  leave.status = "denied";
                  leave.denied = true;
                  leave.save();
                }
              });
            }
            res.render("moreinfoemployee", {
              employee: foundEmployee,
              manager: managerFound,
              moment: moment
            });
          }
        });
    }
  });
});



app.get("/hr/login", (req, res) => {
  res.render("hrlogin");
});

app.post(
  "/hr/login",
  passport.authenticate("hr", {
    successRedirect: "/hr/home",
    failureRedirect: "/hr/login",
    failureFlash: true
  }),
  (req, res) => {
    res.redirect("/hr/home");
  }
);
app.get("/hr/home", ensureAuthenticated, (req, res) => {
  Hr.find({}, (err, manager) => {
    if (err) {
      console.log("err");
    } else {
      res.render("homehr", {
        hr: req.user
      });
    }
  });
});

app.get("/hr/contact", ensureAuthenticated, (req, res) => {
  var hr = req.user.username;
  console.log(hr);
  Hr.findOne({ username: req.user.username })
      .populate("leaves")
      .exec((err, hr) => {
        if (err || !hr) {
          req.flash("error", "Hr not found");
          res.redirect("back");
          console.log("err");
        } else {
          res.render("contactHr", {
            hr: hr,
            moment: moment
          });
        }
      });
});
app.get("/hr/aboutus", ensureAuthenticated, (req, res) => {
  var hr = req.user.username;
  console.log(hr);
  Hr.findOne({ username: req.user.username })
      .populate("leaves")
      .exec((err, hr) => {
        if (err || !hr) {
          req.flash("error", "Hr not found");
          res.redirect("back");
          console.log("err");
        } else {
          res.render("aboutUsHr", {
            hr: hr,
            moment: moment
          });
        }
      });
});

app.get("/hr/:id", ensureAuthenticated, (req, res) => {
  console.log(req.params.id);
  Hr.findById(req.params.id).exec((err, foundHr) => {
    if (err || !foundHr) {
      req.flash("error", "Hr not found");
      res.redirect("back");
    } else {
      res.render("profilehr", { hr: foundHr });
    }
  });
});
app.get("/hr/:id/edit", ensureAuthenticated, (req, res) => {
  Hr.findById(req.params.id, (err, foundHr) => {
    res.render("editHr", { hr: foundHr });
  });
});

app.put("/hr/:id", ensureAuthenticated, (req, res) => {
  console.log(req.body.hr);
  Hr.findByIdAndUpdate(
    req.params.id,
    req.body.hr,
    (err, updateHr) => {
      if (err) {
        req.flash("error", err.message);
        res.redirect("back");
      } else {
        req.flash("success", "Succesfully updated");
        res.redirect("/hr/" + req.params.id);
      }
    }
  );
});

app.get("/hr/:id/leave", (req, res) => {
  Hr.findById(req.params.id).exec((err, hrFound) => {
    if (err) {
      req.flash("error", "Hr not found with requested id");
      res.redirect("back");
    } else {
      // console.log(hrFound);
      Employee.find({ designation: hrFound.designation })
        .populate("leaves")
        .exec((err, employees) => {
          if (err) {
            req.flash("error", "Employee not found with your Project");
            res.redirect("back");
          } else {
            res.render("hrLeaveSign", {
              hr: hrFound,
              employees: employees,

              moment: moment
            });
          }
        });
    }
  });
});
app.get("/hr/:id/leave/:employee_id/info", (req, res) => {
  Hr.findById(req.params.id).exec((err, hrFound) => {
    if (err) {
      req.flash("error", "Hr not found with requested id");
      res.redirect("back");
    } else {
      Employee.findById(req.params.employee_id)
        .populate("leaves")
        .exec((err, foundEmployee) => {
          if (err) {
            req.flash("error", "Emloyee not found with this id");
            res.redirect("back");
          } else {
            res.render("Hrmoreinfoemployee", {
              employee: foundEmployee,
              hr: hrFound,
              moment: moment
            });
          }
        });
    }
  });
});

app.post("/hr/:id/leave/:employee_id/info", (req, res) => {
  Hr.findById(req.params.id).exec((err, hrFound) => {
    if (err) {
      req.flash("error", "Hr not found with requested id");
      res.redirect("back");
    } else {
      Employee.findById(req.params.employee_id)
        .populate("leaves")
        .exec((err, foundEmployee) => {
          if (err) {
            req.flash("error", "Employee not found with this id");
            res.redirect("back");
          } else {
            if (req.body.action === "Approve") {
              foundEmployee.leaves.forEach(function(leave) {
                if (leave.hrstatus === "pending") {
                  leave.hrstatus = "approved";

                  leave.save();
                }
              });
            } else {
              console.log("u denied");
              foundEmployee.leaves.forEach(function(leave) {
                if (leave.hrstatus === "pending") {
                  leave.hrstatus = "denied";

                  leave.save();
                }
              });
            }
            res.render("Hrmoreinfoemployee", {
              employee: foundEmployee,
              hr: hrFound,
              moment: moment
            });
          }
        });
    }
  });
});
//logout for employee

app.get("/logout", (req, res) => {
  req.logout();
  // req.flash("success", "you are logged out");
  res.redirect("/");
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server started at port ${port}`);
});
