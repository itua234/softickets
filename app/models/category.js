module.exports = (sequelize, DataTypes) => {
    const Category = sequelize.define('Category', {
        id: {
            type: DataTypes.BIGINT(20).UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        name: {type: DataTypes.STRING, allowNull: false},
        description: {type: DataTypes.STRING, allowNull: true}
    },{
        tableName: 'categories'
    })

    return Category;
}