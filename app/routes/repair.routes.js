const controller = require("../controllers/repair.controller");

module.exports = function(app){
    app.post('/api/repair/list',controller.get_All);
    app.post('/api/repair/insert',controller.insert);
    app.get('/api/repair/all',controller.all_repair_list);
};