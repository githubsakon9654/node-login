module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("users", {
    id: {
      type: Sequelize.INTEGER(4),
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
    classes: {
      type: Sequelize.STRING
    }
  });
  return User;
};