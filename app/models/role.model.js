module.exports = (sequelize, Sequelize) => {
    const Role = sequelize.define("roles", {
      id: {
        type: Sequelize.INTEGER(4),
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING(25)
      }
    });
  
    return Role;
  };