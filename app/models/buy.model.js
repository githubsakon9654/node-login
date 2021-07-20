module.exports = (sequelize, Sequelize) => {
    const buyform = sequelize.define('buyform', {
        id: {
            type: Sequelize.INTEGER(4),
            primaryKey: true,
            autoIncrement: true
        },
        status: {
            type: Sequelize.BOOLEAN
        },
        repel: {
            type: Sequelize.BOOLEAN
        },
        accept: {
            type: Sequelize.BOOLEAN
        },
        buyprice: {
            type: Sequelize.INTEGER(4)
        },
        store: {
            type: Sequelize.TEXT
        },
        name: {
            type: Sequelize.STRING(55)
        },
        serial: {
            type: Sequelize.STRING(25)
        }
    });
    return buyform;
};