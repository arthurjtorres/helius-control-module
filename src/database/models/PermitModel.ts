import { DataTypes, Model } from "sequelize";
import db from ".";
import sequelize from "sequelize";
import { PermissionEnum } from "./enums/PermissionEnum";

class PermitModel extends Model {
  declare permitId: string;
  declare permitName: string;
  declare permitList: PermissionEnum[];

  declare createdAt: Date;
  declare createdBy: string;
  declare updatedAt: Date;
  declare updatedBy: string;
  declare activated: boolean;
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
  permitList: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
    defaultValue:[],
    
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
  tableName: 'permit',
  schema: 'access_control',
  timestamps: false,
  underscored: true
});

export default PermitModel;