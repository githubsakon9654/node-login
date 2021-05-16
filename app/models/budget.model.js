module.exports = (sequelize, Sequelize) => {
    const budget = sequelize.define('budgets' ,{
        id: {
            type: Sequelize.INTEGER(4),
            primaryKey: true,
            autoIncrement: true
        },
        year: {
            type: Sequelize.DATEONLY
        },
        budget: {
            type: Sequelize.INTEGER(4)
        },
        budget_year:{
            type: Sequelize.STRING(20)
        }
    });
    return budget;
};