import AppRoleModel from "./AppRoleModel";
import AppRolePermitModel from "./AppRolePermitModel";
import ClearanceLevelModel from "./ClearanceLevelModel";
import EmployeeUserModel from "./EmployeeUserModel";
import ExternalUserModel from "./ExternalUserModel";
import MenuModel from "./MenuModel";
import ModuleModel from "./ModuleModel";
import PermitModel from "./PermitModel";
import UserAppRoleModel from "./UserAppRoleModel";
import UserModel from "./UserModel";
import UserModuleModel from "./UserModuleModel";

export const setupAssociations = () => {

  AppRolePermitModel.belongsTo(AppRoleModel, {
    foreignKey: 'fkAppRoleId',
    targetKey: 'appRoleId',
    as: 'AppRole'
  });

  AppRoleModel.hasMany(AppRolePermitModel, {
    foreignKey: 'fkAppRoleId',
    sourceKey: 'appRoleId',
    as: 'AppRolePermit'
  });

  AppRolePermitModel.belongsTo(MenuModel, {
    foreignKey: 'fkMenuId',
    targetKey: 'menuId',
    as: 'Menu'
  });

  MenuModel.hasMany(AppRolePermitModel, {
    foreignKey: 'fkMenuId',
    sourceKey: 'menuId',
    as: 'AppRolePermit'
  });

  AppRolePermitModel.belongsTo(PermitModel, {
    foreignKey: 'fkPermitId',
    targetKey: 'permitId',
    as: 'Permit'
  });

  PermitModel.hasMany(AppRolePermitModel, {
    foreignKey: 'fkPermitId',
    sourceKey: 'permitId',
    as: 'AppRolePermit'
  });

  EmployeeUserModel.belongsTo(UserModel, {
    foreignKey: 'fkUserId',
    targetKey: 'userId',
    as: 'User'
  });

  UserModel.hasOne(EmployeeUserModel, {
    foreignKey: 'fkUserId',
    sourceKey: 'userId',
    as: 'EmployeeUser'
  });

  ExternalUserModel.belongsTo(UserModel, {
    foreignKey: 'fkUserId',
    targetKey: 'userId',
    as: 'User'
  });

  UserModel.hasOne(ExternalUserModel, {
    foreignKey: 'fkUserId',
    sourceKey: 'userId',
    as: 'ExternalUser'
  });

  MenuModel.belongsTo(ModuleModel, {
    foreignKey: 'fkModuleId',
    targetKey: 'moduleId',
    as: 'Module'
  });

  ModuleModel.hasMany(MenuModel, {
    foreignKey: 'fkModuleId',
    sourceKey: 'moduleId',
    as: 'Menu'
  });




  UserAppRoleModel.belongsTo(UserModel, {
    foreignKey: 'fkUserId',
    targetKey: 'userId',
    as: 'User',
  });

  UserModel.hasMany(UserAppRoleModel, {
    foreignKey: 'fkUserId',
    sourceKey: 'userId',
    as: 'UserAppRole',
  });

  UserAppRoleModel.belongsTo(AppRoleModel, {
    foreignKey: 'fkAppRoleId',
    targetKey: 'appRoleId',
    as: 'AppRole',
  });

  AppRoleModel.hasMany(UserAppRoleModel, {
    foreignKey: 'fkAppRoleId',
    sourceKey: 'appRoleId',
    as: 'UserAppRole',
  });

  UserAppRoleModel.belongsTo(ModuleModel, {
    foreignKey: 'fkModuleId',
    targetKey: 'moduleId',
    as: 'Module',
  });

  ModuleModel.hasMany(UserAppRoleModel, {
    foreignKey: 'fkModuleId',
    sourceKey: 'moduleId',
    as: 'UserAppRole',
  });

  UserModel.belongsTo(ClearanceLevelModel, {
    foreignKey: 'fkClearanceId',
    targetKey: 'clearanceId',
    as: 'ClearanceLevel'
  });

  ClearanceLevelModel.hasMany(UserModel, {
    foreignKey: 'fkClearanceId',
    sourceKey: 'clearanceId',
    as: 'User'
  });

  console.log("✅ Associações configuradas com sucesso.");
}