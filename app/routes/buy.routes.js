const controller = require("../controllers/buy.controller.js");

module.exports = function (app) {
    app.post("/api/buy/insert", controller.insert_buy_sup);
    app.get("/api/buy/listAll", controller.buyList);
    app.post('/api/buy/byid',controller.get_by_id);
    app.post('/api/buy/update', controller.set_buy_status);
    app.post('/api/buy/filldate', controller.fillDate);
};