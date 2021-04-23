module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("users", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: Sequelize.STRING,
    },
    password: {
      type: Sequelize.STRING
    },
    fullname: {
      type: Sequelize.STRING
    },
    price: {
      type: Sequelize.INTEGER
    },
    classes: {
      type: Sequelize.STRING
    }
  });
  return User;
};