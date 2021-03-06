module.exports = (sequelize, Sequelize) => {
    const returns = sequelize.define("returns", {
        id: {
            type: Sequelize.INTEGER(4),
            primaryKey: true,
            autoIncrement: true
        },
        re_name: {
            type: Sequelize.STRING(55)
        },
        status: {
            type: Sequelize.BOOLEAN
        }
    });
    return returns;
};