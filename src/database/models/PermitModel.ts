import { DataTypes, Model } from "sequelize";
import db from ".";
import sequelize from "sequelize";
class PermitModel extends Model {
  declare permitId: string;
  declare permitName: string;

  declare createdAt: Date;
  declare createdBy: string;
  declare updatedAt: Date;
  declare updatedBy: string;
}

PermitModel.init({
  permitId: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
  },
  permitName: {
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
  tableName: 'permit',
  schema: 'access_control',
  timestamps: false,
  underscored: true
});

export default PermitModel;