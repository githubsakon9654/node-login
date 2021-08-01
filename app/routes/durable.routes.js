const controller = require("../controllers/durable.controller");

module.exports = function(app) {
    app.post("/api/durable/insert", controller.createDurable);
    app.get("/api/durable/listAll", controller.listAll_durable);
    app.post("/api/durable/update", controller.updateDurable);
    app.post("/api/durable/userlist", controller.listUser_durable);
    app.post("/api/durable/delete", controller.deleteDurable);
    app.post('/api/durable/fillter', controller.fillter);
    app.post('/api/durable/updatenull', controller.update_appove_null);
    app.post('/api/durable/insertcate', controller.createDurableCate);
    app.get('/api/durable/ducate', controller.findDurableCate);
    app.post('/api/durable/ducatebyid', controller.findDurableCateByid);
};