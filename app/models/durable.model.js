module.exports = (sequelize, Sequelize) => {
    const durable = sequelize.define('durable',{
        id: {
            type: Sequelize.INTEGER(4),
            primaryKey: true,
            autoIncrement: true
        },
        du_name: {
            type: Sequelize.STRING(25)
        },
        du_status: {
            type: Sequelize.STRING(25)
        },
        du_serial: {
            type: Sequelize.STRING(55)
        },
        proven: {
            type: Sequelize.STRING(25)
        },
        du_price: {
            type: Sequelize.INTEGER(4)
        },
        date: {
            type: Sequelize.DATEONLY
        }
    });
    return durable;
};

