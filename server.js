const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

var corsOptions = {
    origin: 'http://localhost:4200'
};

const db = require('./app/models');
const Role = db.role;

// db.sequelize.sync({force: true}).then(() => {
//     console.log('Drop and Resync Db');
//     initial();
// });


app.use(cors(corsOptions));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true}));

require('./app/routes/user.routes')(app);
require('./app/routes/auth.routes')(app);
require('./app/routes/supplie.routes')(app);
require('./app/routes/offer.routes')(app);
require('./app/routes/buy.routes')(app);
require('./app/routes/reveal.routes')(app);
require('./app/routes/durable.routes')(app);
require('./app/routes/borrow.routes')(app);
require('./app/routes/report.routes')(app);


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
}