module.exports = ( sequelize , Sequelize) => {
    const supplie_year = sequelize.define("supplie_year", {
        id: {
            type: Sequelize.INTEGER(4),
            primaryKey: true,
            autoIncrement: true
        },
        year: {
            type: Sequelize.STRING(20)
        },
        unit:{
            type: Sequelize.INTEGER(5)
        }
    });
    return supplie_year;
};