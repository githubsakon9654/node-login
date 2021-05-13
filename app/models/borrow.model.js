module.exports = (sequelize, Sequelize) => {
    const borrow = sequelize.define('borrow' ,{
        id: {
            type: Sequelize.INTEGER(4),
            primaryKey: true,
            autoIncrement: true
        },
        borrow_name: {
            type: Sequelize.STRING(55)
        },
        admin_approve: {
            type: Sequelize.BOOLEAN
        },
        dire_approvev: {
            type: Sequelize.BOOLEAN
        },
        accept: {
            type: Sequelize.BOOLEAN
        }
    });
    return borrow;
};