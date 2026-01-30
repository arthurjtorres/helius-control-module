import { DataTypes, Model } from "sequelize";
import db from ".";
import UserModel from "./UserModel";
import AppRoleModel from "./AppRoleModel";
import ModuleModel from "./ModuleModel";
import sequelize from "sequelize";

class UserAppRoleModel extends Model {
  declare userAppRoleId: string;
  declare fkUserId: string;
  declare fkAppRoleId: string;
  declare fkModuleId: string;

  declare createdAt: Date;
  declare createdBy: string;
  declare updatedAt: Date;
  declare updatedBy: string;
  declare activated: boolean;
}

UserAppRoleModel.init({
  userAppRoleId: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
  },
  fkUserId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'user',
      key: 'user_id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
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
  fkModuleId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'module',
      key: 'module_id',
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
  tableName: 'user_app_role',
  schema: 'access_control',
  timestamps: false,
  underscored: true
});

UserAppRoleModel.belongsTo(UserModel, {
  foreignKey: 'fkUserId',
  as: 'user',
});
UserModel.hasMany(UserAppRoleModel, {
  foreignKey: 'fkUserId',
  as: 'userAppRoles',
});

UserAppRoleModel.belongsTo(AppRoleModel, {
  foreignKey: 'fkAppRoleId',
  as: 'role',
});
AppRoleModel.hasMany(UserAppRoleModel, {
  foreignKey: 'fkAppRoleId',
  as: 'appRole',
});

UserAppRoleModel.belongsTo(ModuleModel, {
  foreignKey: 'fkModuleId',
  as: 'module',
});
ModuleModel.hasMany(UserAppRoleModel, {
  foreignKey: 'fkModuleId',
  as: 'appModule',
})

export default UserAppRoleModel;