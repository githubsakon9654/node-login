module.exports = (sequelize, Sequelize) => {
    const ducate = sequelize.define("ducates", {
        id: {
            type: Sequelize.INTEGER(4),
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: Sequelize.STRING(55)
        },
        serial: {
            type: Sequelize.STRING(55)
        }
    });
    return ducate;
};