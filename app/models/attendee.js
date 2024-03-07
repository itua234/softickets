module.exports = (sequelize, DataTypes) => {
    const Attendee = sequelize.define('Attendee', {
        id: {
            type: DataTypes.BIGINT(20).UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        event_id: {
            type: DataTypes.BIGINT(20).UNSIGNED, 
            foreignKey: true,
            references: {
                model: {tableName: 'events'},
                key: 'id'
            },
            allowNull: false
        },
        firstname: {
            type: DataTypes.STRING,
            allowNull: false,
            get() {
                const rawValue = this.getDataValue('firstname');
                return rawValue ? rawValue : null;
            },
            set(value) {
                value = value.toLowerCase();
                const val = value.charAt(0).toUpperCase() + value.slice(1);
                this.setDataValue('firstname', val);
            }
        },
        lastname: {
            type: DataTypes.STRING,
            allowNull: false,
            get() {
                const rawValue = this.getDataValue('lastname');
                return rawValue ? rawValue : null;
            },
            set(value) {
                value = value.toLowerCase();
                const val = value.charAt(0).toUpperCase() + value.slice(1);
                this.setDataValue('lastname', val);
            }
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            get() {
                const rawValue = this.getDataValue('email');
                return rawValue ? rawValue : null;
            },
            set(value) {
                this.setDataValue('email', value.toLowerCase());
            }
        },
        phone: {type: DataTypes.STRING, allowNull: false},
    },{
        tableName: 'attendees'
    })

    return Attendee;
}