const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Sequelize, DataTypes } = require("sequelize");
const app = express();

var corsOptions = {
    origin: 'http://localhost:4200'
};

const db = require('./app/models');
const { CL } = require('./pdfmake/pdfmake');
const Role = db.role;
const Store = db.store;
const Supcate = db.supcate;
const Ducate = db.ducate;
const add = db.ADD;
const Cls = db.cls;
// db.sequelize.sync({ force: true }).then(() => {
//     console.log('Drop and Resync Db');
//     initial();
// });


app.use(cors(corsOptions));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

require('./app/routes/user.routes')(app);
require('./app/routes/auth.routes')(app);
require('./app/routes/supplie.routes')(app);
require('./app/routes/offer.routes')(app);
require('./app/routes/buy.routes')(app);
require('./app/routes/reveal.routes')(app);
require('./app/routes/durable.routes')(app);
require('./app/routes/borrow.routes')(app);
require('./app/routes/report.routes')(app);
require('./app/routes/returns.routes')(app);
require('./app/routes/repair.routes')(app);


const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});

function initial() {
    Role.create({
        name: 'user'
    });
    Role.create({
        name: 'director'
    });
    Role.create({
        name: 'admin'
    });
    Store.create({
        name: 'ร้าน..',
        contect: 'ที่อยู่.. เบอร์ติดต่อ'
    });
    add.addColumn('offer_sup', 'unit', { type: DataTypes.INTEGER(4) });
    add.addColumn('reveal_sup', 'unit', { type: DataTypes.INTEGER(4) });
    add.addColumn('reveal_sup', 'remain', { type: DataTypes.INTEGER(5) });
    add.addColumn('supplie_buy', 'unit', { type: DataTypes.INTEGER(4) });
    add.addColumn('supplie_buy', 'sum', { type: DataTypes.INTEGER(6) });
    add.addColumn('supplie_buy', 'remain', { type: DataTypes.INTEGER(5) });
    Cls.create({
        name: 'ชั้น อ.1'
    });
    Cls.create({
        name: 'ชั้น อ.2'
    });
    Cls.create({
        name: 'ชั้น ป.1'
    });
    Cls.create({
        name: 'ชั้น ป.2'
    });
    Cls.create({
        name: 'ชั้น ป.3'
    });
    Cls.create({
        name: 'ชั้น ป.4'
    });
    Cls.create({
        name: 'ชั้น ป.5'
    });
    Cls.create({
        name: 'ชั้น ป.6'
    });
    Supcate.create({
        name: 'วัสดุสำนักงาน'
    });
    Supcate.create({
        name: 'วัสดุโฆษณาและเผยแพร่'
    });
    Supcate.create({
        name: 'วัสดุกีฬา'
    });
    Supcate.create({
        name: 'วัสดุคอมพิวเตอร์'
    });
    Ducate.create({
        name: 'โต๊ะเก้าอี้นักเรียน',
        serial: '7110'
    });
}