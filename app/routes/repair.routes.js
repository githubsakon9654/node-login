const controller = require("../controllers/repair.controller");

module.exports = function(app){
    app.get('/api/repair/list',controller.get_All);
    app.post('/api/repair/insert',controller.insert);
};