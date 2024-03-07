const { encrypt, decrypt } = require('../util/helper');
export default (sequelize, DataTypes) => {
    const BankDetail = sequelize.define('BankDetail', {
        id: {
            type: DataTypes.BIGINT(20).UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        user_id: {
            type: DataTypes.BIGINT(20).UNSIGNED,
            foreignKey: true,
            references: {
                model: {tableName: 'users'},
                key: 'id'
            },
            allowNull: false
        },
        account_name: {
            type: DataTypes.TEXT,
            allowNull: false,
            get() {
                const rawValue = this.getDataValue('account_name');
                return rawValue ? decrypt(rawValue) : null;
            },
            set(value) {
                this.setDataValue('account_name', encrypt(value));
            }
        },
        account_number: {
            type: DataTypes.TEXT,
            allowNull: false,
            get() {
                const rawValue = this.getDataValue('account_number');
                return rawValue ? decrypt(rawValue) : null;
            },
            set(value) {
                this.setDataValue('account_number', encrypt(value));
            }
        },
        bank_name: {type: DataTypes.STRING, allowNull: false},
        bank_code: {type: DataTypes.STRING, allowNull: false}
    },{
        tableName: 'bank_details'
    })

    return BankDetail;
}