module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("users", {
        id: {
            type: Sequelize.INTEGER(4),
            primaryKey: true,
            autoIncrement: true
        },
        username: {
            type: Sequelize.STRING(55),
        },
        password: {
            type: Sequelize.STRING
        },
        fullname: {
            type: Sequelize.STRING(55)
        }
    });
    return User;
};