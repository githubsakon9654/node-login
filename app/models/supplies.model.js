module.exports = ( sequelize , Sequelize) => {
    const supplie = sequelize.define("supplie", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        supplie_name: {
            type: Sequelize.STRING
        },
        price: {
            type: Sequelize.INTEGER
        },
        unit: {
            type: Sequelize.INTEGER
        },
        unit_name: {
            type: Sequelize.STRING
        }
    });
    return supplie;
};