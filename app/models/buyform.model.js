module.exports = (sequelize, Sequelize) => {
    const buyform = sequelize.define("buyforms",{
        id: {
            type: Sequelize.INTEGER(4),
            primaryKey: true,
            autoIncrement: true
        },
        status: {
            type: Sequelize.BOOLEAN
        },
        buyprice: {
            type: Sequelize.INTEGER(4)
        },
        store: {
            type: Sequelize.STRING(25)
        }
        
    });
    return buyform;
};