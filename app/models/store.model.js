module.exports = ( sequelize , Sequelize) => {
    const store = sequelize.define("stores", {
        id: {
            type: Sequelize.INTEGER(4),
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: Sequelize.STRING(55)
        },
        contect: {
            type: Sequelize.TEXT
        }
    });
    return store;
};