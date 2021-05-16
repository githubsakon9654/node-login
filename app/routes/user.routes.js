const { authJwt } = require("../middleware");
const controller = require("../controllers/user.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/user/all",controller.allAccess);
  app.post("/api/user/finduser",controller.findUser);
  app.post("/api/user/findid",controller.findUserById);
  app.post('/api/user/update',controller.update_user);
  app.post('/api/user/delete', controller.deleteUser);
  app.post('/api/user/repass',controller.changePass);
  app.post('/api/user/reset',controller.defaultPass);
  app.post('/api/user/check',controller.checkPass);
  app.post('/api/user/budgetInsert',controller.insert_budget);
  app.post('/api/user/budget',controller.getbudget);
};