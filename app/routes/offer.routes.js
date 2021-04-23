const controller = require("../controllers/offer.controller");

module.exports = function(app) {
    app.post("/api/offer/insert", controller.insert_off_sup);
    app.post("/api/offer/appove", controller.offer_appove);
    app.get("/api/offer/getappove", controller.get_offer_appove);
    app.get("/api/offer/listAll", controller.getAll_offer);
    app.post('/api/offer/detail',controller.get_datail_offer);
    app.post('/api/offer/update',controller.update_appove);
};