module.exports = (sequelize, Sequelize) => {
    const repair = sequelize.define('repair' ,{
        id: {
            type: Sequelize.INTEGER(4),
            primaryKey: true,
            autoIncrement: true
        },
        rep_name: {
            type: Sequelize.STRING(55)
        },
        rep_detail: {
            type: Sequelize.TEXT
        },
        rep_price: {
            type: Sequelize.INTEGER(5)
        }
    });
    return repair;
};

