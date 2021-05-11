const config = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(
  config.DB,
  config.USER,
  config.PASSWORD,
  {
    host: config.HOST,
    dialect: config.dialect,
    operatorsAliases: false,

    pool: {
      max: config.pool.max,
      min: config.pool.min,
      acquire: config.pool.acquire,
      idle: config.pool.idle
    }
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("../models/user.model.js")(sequelize, Sequelize);
db.role = require("../models/role.model.js")(sequelize, Sequelize);
db.supplie = require("../models/supplies.model.js")(sequelize, Sequelize);
db.offer = require("../models/offer.model.js")(sequelize, Sequelize);
db.buyform = require("./buyform.model.js")(sequelize, Sequelize);
db.reveal = require("./reveal.model.js")(sequelize, Sequelize);
db.durable = require("./durable.model.js")(sequelize, Sequelize);
db.borrow = require("./borrow.model.js")(sequelize, Sequelize);
db.returns = require('./return.model.js')(sequelize, Sequelize);
db.repair = require('./repair.model.js')(sequelize,Sequelize);
db.ducate = require('./ducate.model.js')(sequelize,Sequelize);

db.durable.hasMany(db.repair,{as:'repairs'});
db.repair.belongsTo(db.durable,{
  foreignKey: 'durableId', as: 'durables'
})

db.ducate.hasMany(db.durable,{as:'durables'});
db.durable.belongsTo(db.ducate,{
  foreignKey: 'ducateId', as: 'ducates'
})

db.user.hasMany(db.returns, {as: 'returns'});
db.returns.belongsTo(db.user, {
  foreignKey: "userId", as: 'users'
});
db.user.hasMany(db.offer, {as: "offers"});
db.offer.belongsTo(db.user, {
  foreignKey: "userId", as: "users"
});
db.user.hasMany(db.reveal, {as: "reveals"});
db.reveal.belongsTo(db.user, {
  foreignKey: "userId", as: "users"
});
db.user.hasMany(db.buyform, {as: "buyforms"});
db.buyform.belongsTo(db.user, {
  foreignKey: "userId", as: "users"
});
db.user.hasMany(db.durable, {as: "durables"});
db.durable.belongsTo(db.user, {
  foreignKey: "userId", as: "users"
});
db.user.hasMany(db.borrow, {as: "borrows"});
db.borrow.belongsTo(db.user, {
  foreignKey: "userId", as: "users"
});

db.returns.belongsToMany(db.durable,{
  through: "re_du",
  foreignKey: "returnId",
  otherKey: "duId"
});
db.durable.belongsToMany(db.returns,{
  through: "re_du",
  foreignKey: "duId",
  otherKey: "returnId"
});

db.borrow.belongsToMany(db.durable,{
  through: "bor_du",
  foreignKey: "borrowId",
  otherKey: "duId"
});
db.durable.belongsToMany(db.borrow,{
  through: "bor_du",
  foreignKey: "duId",
  otherKey: "borrowId"
});

db.reveal.belongsToMany(db.supplie, {
  through: "reveal_sup",
  foreignKey: "revealId",
  otherKey: "supplieId"
});
db.supplie.belongsToMany(db.reveal, {
  through: "reveal_sup",
  foreignKey: "supplieId",
  otherKey: "revealId"
});

db.offer.belongsToMany(db.supplie, {
  through: "offer_sup",
  foreignKey: "offerId",
  otherKey: "supplieId"
});
db.supplie.belongsToMany(db.offer, {
  through: "offer_sup",
  foreignKey: "supplieId",
  otherKey: "offerId"
});

db.buyform.belongsToMany(db.supplie, {
  through: "supplie_buy",
  foreignKey: "buyId",
  otherKey: "supplieId"
});
db.supplie.belongsToMany(db.buyform, {
  through: "supplie_buy",
  foreignKey: "supplieId",
  otherKey: "buyId"
});

db.role.belongsToMany(db.user, {
  through: "user_roles",
  foreignKey: "roleId",
  otherKey: "userId"
});
db.user.belongsToMany(db.role, {
  through: "user_roles",
  foreignKey: "userId",
  otherKey: "roleId"
});

db.ROLES = ["user", "admin", "director"];

module.exports = db;