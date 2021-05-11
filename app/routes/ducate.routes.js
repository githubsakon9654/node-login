const controller = require("../controllers/ducate.controller");

module.exports = function(app){
    app.get('/api/ducate/list',controller.get_All);
};