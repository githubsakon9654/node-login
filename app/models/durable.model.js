module.exports = (sequelize, Sequelize) => {
    const durable = sequelize.define('durable' ,{
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        du_name: {
            type: Sequelize.STRING
        },
        du_status: {
            type: Sequelize.STRING
        },
        du_serial: {
            type: Sequelize.STRING
        }
    });
    return durable;
};

