const controller = require("../controllers/borrow.controller");

module.exports = function(app){
    app.post("/api/borrow/insert",controller.borrow_insert);
    app.get("/api/borrow/listall",controller.list_all);
    app.post("/api/borrow/listuser",controller.list_user);
    app.post("/api/borrow/detail",controller.borrow_detail);
    app.post("/api/borrow/updateAppove",controller.update_appove);
    app.post("/api/borrow/update",controller.update);
};