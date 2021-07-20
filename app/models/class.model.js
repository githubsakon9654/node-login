module.exports = (sequelize, Sequelize) => {
    const cls = sequelize.define("clas", {
        id: {
            type: Sequelize.INTEGER(4),
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: Sequelize.STRING(55)
        }
    });
    return cls;
};