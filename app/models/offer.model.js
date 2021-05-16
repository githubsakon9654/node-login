module.exports = (sequelize, Sequelize) => {
    const offer = sequelize.define("offer", {
        id: {
            type: Sequelize.INTEGER(4),
            primaryKey: true,
            autoIncrement: true
        },
        offer_name: {
            type: Sequelize.STRING(55)
        },
        offer_status: {
            type: Sequelize.BOOLEAN
        },
        price:{
            type: Sequelize.INTEGER(6)
        }
    });
    return offer;
};