module.exports = (sequelize, Sequelize) => {
    const ducate = sequelize.define('ducate' ,{
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: Sequelize.STRING
        },
        serial: {
            type: Sequelize.STRING
        }
    });
    return ducate;
};

