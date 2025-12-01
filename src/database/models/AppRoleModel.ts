import { DataTypes, Model } from "sequelize";
import db from ".";
import sequelize from "sequelize";

class AppRoleModel extends Model {
  declare appRoleId: string;
  declare appRoleName: string;

  declare createdAt: Date;
  declare createdBy: string;
  declare updatedAt: Date;
  declare updatedBy: string;
}

AppRoleModel.init({
  appRoleId: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
  },
  appRoleName: {
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
    allowNull: false,
    type: sequelize.DATE,
    defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
  },
  updatedBy: {
    allowNull: false,
    type: DataTypes.UUID,
  },
}, {
  sequelize: db,
  tableName: 'app_role',
  schema: 'access_control',
  timestamps: false,
  underscored: true
});

export default AppRoleModel;