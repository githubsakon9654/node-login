module.exports = ( sequelize , Sequelize) => {
    const year_unit = sequelize.define("year_units", {
        id: {
            type: Sequelize.INTEGER(4),
            primaryKey: true,
            autoIncrement: true
        },
        unit: {
            type: Sequelize.INTEGER(3)
        }
    });
    return year_unit;
};