const controller = require('../reports/report');

module.exports = function(app){
    app.get('/api/report/supplielist', controller.supplieList);
    app.get('/api/report/durablelist',controller.durableList);
    app.get('/api/report/offerlist',controller.offerList);
    app.get('/api/report/borrowlist',controller.borrowList);
    app.get('/api/report/reveallist',controller.revealList);
    app.get('/api/report/revealuser/:id',controller.revealByUser);
    app.get('/api/report/revealdetail/:id',controller.revealDetail);
    app.get('/api/report/buylist',controller.buylist);
    app.get('/api/report/buyform/:id',controller.buyform);
    app.get('/api/report/return/:id',controller.returns);
    app.get('/api/report/returnAll',controller.returnsAll);
    app.get('/api/report/returnDetail/:id',controller.returnDetail);
};