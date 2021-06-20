const controller = require("../controllers/supplie.controller.js");

module.exports = function(app) {
    app.post("/api/supplie/insert", controller.createSupplie);
    app.post("/api/supplie/getsup", controller.getSupplie);
    app.post("/api/supplie/listall", controller.getNew);
    app.post("/api/supplie/update", controller.updateSupplie);
    app.post("/api/supplie/list", controller.getSupplie);
    app.post("/api/supplie/delete", controller.deleteSuppie);
    app.post("/api/supplie/filter", controller.filter);
    app.post("/api/supplie/unit", controller.insertUnit);
    app.post("/api/supplie/unitup", controller.updateUnit);
    app.post("/api/supplie/deleteunit", controller.deleteunit);
    app.get("/api/supplie/store", controller.store);
    app.post("/api/supplie/storeinsert", controller.insertStore);
    app.post("/api/supplie/new", controller.listAll_supplie);
};