module.exports = (sequelize, Sequelize) => {
    const supcate = sequelize.define("supcates", {
        id: {
            type: Sequelize.INTEGER(4),
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: Sequelize.STRING(55)
        }
    });
    return supcate;
};