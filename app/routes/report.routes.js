const controller = require('../reports/report');

module.exports = function(app){
    app.get('/api/report/supplielist/:id/:id2', controller.supplieList);
    app.get('/api/report/durablelist/:id/:id2',controller.durableList);
    app.get('/api/report/offerlist/:id/:id2',controller.offerList);
    app.get('/api/report/borrowlist/:id/:id2',controller.borrowList);
    app.get('/api/report/borrowlist/:id',controller.borrowListByUser);
    app.get('/api/report/reveallist/:id/:id2',controller.revealList);
    app.get('/api/report/revealuser/:id',controller.revealByUser);
    app.get('/api/report/revealdetail/:id',controller.revealDetail);
    app.get('/api/report/buylist/:id/:id2',controller.buylist);
    app.get('/api/report/buyform/:id',controller.buyform);
    app.get('/api/report/return/:id',controller.returns);
    app.get('/api/report/returnAll/:id/:id2',controller.returnsAll);
    app.get('/api/report/returnDetail/:id',controller.returnDetail);
};