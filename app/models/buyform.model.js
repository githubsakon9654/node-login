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
            type: Sequelize.TEXT(100)
        },
        name: {
            type: Sequelize.STRING(55)
        }
        
    });
    return buyform;
};