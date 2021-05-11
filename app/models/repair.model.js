module.exports = (sequelize, Sequelize) => {
    const repair = sequelize.define('repair' ,{
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        rep_name: {
            type: Sequelize.STRING
        },
        rep_detail: {
            type: Sequelize.STRING
        },
        rep_price: {
            type: Sequelize.STRING
        }
    });
    return repair;
};

