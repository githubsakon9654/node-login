module.exports = (sequelize, Sequelize) => {
    const offer = sequelize.define("offer", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        offer_name: {
            type: Sequelize.STRING
        },
        offer_status: {
            type: Sequelize.BOOLEAN
        }
    });
    return offer;
};