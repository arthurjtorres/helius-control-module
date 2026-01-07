import { DataTypes, Model } from 'sequelize';
import db from '.';
import sequelize from 'sequelize';

//Nível de acesso - Autoridade global (SUPERADMIN > ADMIN > SUPERVISOR > USER)
class ClearanceLevelModel extends Model {
	declare clearanceId: string;
	declare clearanceName: string;

	declare createdAt: Date;
  declare createdBy: string;
  declare updatedAt: Date;
  declare updatedBy: string;
	declare activated: boolean;
}

ClearanceLevelModel.init({
	clearanceId: {
		type: DataTypes.UUID,
		primaryKey: true,
		defaultValue: DataTypes.UUIDV4,
		allowNull: false,
	},
	clearanceName: {
		type: sequelize.STRING,
		allowNull: false,
	},

	createdAt: {
		allowNull: false,
		type: sequelize.DATE,
		defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
	},
	createdBy: {
		allowNull: false,
		type: DataTypes.UUID,

	},
	updatedAt: {
		allowNull: true,
		type: sequelize.DATE,
		defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
	},
	updatedBy: {
		allowNull: true,
		type: DataTypes.UUID,
	},
	activated: {
    allowNull: false,
    type: sequelize.BOOLEAN,
    defaultValue: true,
  },
}, {
	sequelize: db,
	tableName: 'clearance_level',
	schema: 'access_control',
	timestamps: false,
	underscored: true,
}
);

export default ClearanceLevelModel;