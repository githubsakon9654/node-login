module.exports = (sequelize, Sequelize) => {
    const returns = sequelize.define("returns", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        re_name: {
            type: Sequelize.STRING
        },
        status: {
            type: Sequelize.BOOLEAN
        }
    });
    return returns;
};