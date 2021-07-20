module.exports = (sequelize, Sequelize) => {
    const reveal = sequelize.define("reveal", {
        id: {
            type: Sequelize.INTEGER(4),
            primaryKey: true,
            autoIncrement: true
        },
        admin_approve: {
            type: Sequelize.BOOLEAN
        },
        total_price: {
            type: Sequelize.INTEGER(6)
        },
        accept: {
            type: Sequelize.BOOLEAN
        },
        serial: {
            type: Sequelize.STRING(25)
        }
    });
    return reveal;
};