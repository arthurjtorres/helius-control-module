import { DataTypes, Model } from "sequelize";
import db from ".";
import PermitModel from "./PermitModel";
import MenuModel from "./MenuModel";
import AppRoleModel from "./AppRoleModel";
import sequelize from "sequelize";

class AppRolePermitModel extends Model {
  declare appRolePermitId: string;
  declare fkAppRoleId: string;
  declare fkMenuId: string;
  declare fkPermitId: string;

  declare createdAt: Date;
  declare createdBy: string;
  declare updatedAt: Date;
  declare updatedBy: string;
}

AppRolePermitModel.init({
  appRolePermitId: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
  },
  fkAppRoleId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'app_role',
      key: 'app_role_id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  fkMenuId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'menu',
      key: 'menu_id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  fkPermitId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'permit',
      key: 'permit_id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
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
  tableName: 'app_role_permit',
  schema: 'access_control',
  timestamps: false,
  underscored: true
});

AppRolePermitModel.belongsTo(AppRoleModel, {
  foreignKey: "fkAppRoleId",
  as: "role"
});
AppRoleModel.hasMany(AppRolePermitModel, {
  foreignKey: "fkAppRoleId",
  as: "rolePermits"
});

AppRolePermitModel.belongsTo(MenuModel, {
  foreignKey: "fkMenuId",
  as: "menu"
});
MenuModel.hasMany(AppRolePermitModel, {
  foreignKey: "fkMenuId",
  as: "menuPermits"
});

AppRolePermitModel.belongsTo(PermitModel, {
  foreignKey: "fkPermitId",
  as: "Permit"
});
PermitModel.hasMany(AppRolePermitModel, {
  foreignKey: "fkPermitId",
  as: "PermitAssignments"
});

export default AppRolePermitModel;