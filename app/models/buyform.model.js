module.exports = (sequelize, Sequelize) => {
    const buyform = sequelize.define("buyforms",{
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        status: {
            type: Sequelize.BOOLEAN
        },
        buyprice: {
            type: Sequelize.INTEGER
        }
    });
    return buyform;
};