module.exports = ( sequelize , Sequelize) => {
    const supplie = sequelize.define("supplie", {
        id: {
            type: Sequelize.INTEGER(4),
            primaryKey: true,
            autoIncrement: true
        },
        supplie_name: {
            type: Sequelize.STRING(25)
        },
        price: {
            type: Sequelize.INTEGER(4)
        },
        unit_name: {
            type: Sequelize.STRING(15)
        }
    });
    return supplie;
};