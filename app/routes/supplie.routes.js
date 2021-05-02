const controller = require("../controllers/supplie.controller.js");

module.exports = function(app) {
    app.post("/api/supplie/insert", controller.createSupplie);
    app.get("/api/supplie/getsup/:id", controller.getSupplie);
    app.get("/api/supplie/listall", controller.listAll_supplie);
    app.post("/api/supplie/update", controller.updateSupplie);
    app.post("/api/supplie/list", controller.getSupplie);
    app.post("/api/supplie/delete", controller.deleteSuppie);
    app.post("/api/supplie/filter", controller.filter);
};