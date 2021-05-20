const controller = require('../reports/report');

module.exports = function(app){
    app.get('/api/report/supplielist/:id/:id2/:id3', controller.supplieList);
    app.get('/api/report/durablelist/:id/:id2/:id3',controller.durableList);
    app.get('/api/report/offerlist/:id/:id2/:id3',controller.offerList);
    app.get('/api/report/borrowlist/:id/:id2/:id3',controller.borrowList);
    app.get('/api/report/borrowuser/:id/:id2/:id3',controller.borrowListByUser);
    app.get('/api/report/reveallist/:id/:id2/:id3',controller.revealList);
    app.get('/api/report/revealuser/:id/:id2/:id3',controller.revealByUser);
    app.get('/api/report/revealdetail/:id/:id2/:id3',controller.revealDetail);
    app.get('/api/report/buylist/:id/:id2/:id3',controller.buylist);
    app.get('/api/report/buyform/:id/:id2/:id3',controller.buyform);
    app.get('/api/report/return/:id/:id2/:id3',controller.returns);
    app.get('/api/report/returnAll/:id/:id2/:id3',controller.returnsAll);
    app.get('/api/report/returnDetail/:id/:id2/:id3',controller.returnDetail);
};