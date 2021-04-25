const controller = require('../controllers/returns.controller');

module.exports = function(app){
    app.get('/api/return/list',controller.returns_Alllist);
    app.post('/api/return/userlist',controller.return_user_list);
    app.post('/api/return/insertreturn',controller.insert_return);
    app.post('/api/return/fillter',controller.fillter);
    app.post('/api/return/detail',controller.return_detail);
    app.post('/api/return/update',controller.update_status);
};