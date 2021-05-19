const controller = require('../controllers/reveal.controller');

module.exports = function(app){
    app.get('/api/reveal/listAll', controller.reveal_list_all);
    app.post('/api/reveal/listByUser', controller.reveal_list_user);
    app.post('/api/reveal/insert', controller.insert_reveal_sup);
    app.post('/api/reveal/detail', controller.get_detail_reveal);
    app.post('/api/reveal/updateAppove', controller.update_appove);
    app.post('/api/reveal/filldate', controller.fill_date);
};