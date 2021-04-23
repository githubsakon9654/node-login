module.exports = (sequelize, Sequelize) => {
    const borrow = sequelize.define('borrow' ,{
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        borrow_name: {
            type: Sequelize.STRING
        },
        admin_approve: {
            type: Sequelize.BOOLEAN
        },
        dire_approvev: {
            type: Sequelize.BOOLEAN
        },
    });
    return borrow;
};