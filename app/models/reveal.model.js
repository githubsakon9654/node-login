module.exports = (sequelize, Sequelize) => {
    const reveal = sequelize.define("reveal", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        admin_approve: {
            type: Sequelize.BOOLEAN
        },
        dire_approvev: {
            type: Sequelize.BOOLEAN
        },
        total_price: {
            type: Sequelize.INTEGER
        },
        accept: {
            type: Sequelize.BOOLEAN
        }
    });
    return reveal;
};