import joi from "joi";

const AppRoleValidation = joi.object({
  AppRoleName: joi.string().required(),

  createdAt: joi.date().required(),
  createdBy: joi.string().required(),
});

const ClearanceLevelValidation = joi.object({
  clearanceName: joi.string().required(),

  createdAt: joi.date().required(),
  createdBy: joi.string().required(),
});

const MenuValidation = joi.object({
  menuName: joi.string().required(),
  fkModuleId: joi.string().uuid().required(),

  createdAt: joi.date().required(),
  createdBy: joi.string().required(),
});

const ModuleValidation = joi.object({
  moduleName: joi.string().required(),
  moduleDescription: joi.string().required(),

  createdAt: joi.date().required(),
  createdBy: joi.string().required(),
});

const PermitValidation = joi.object({
  permitName: joi.string().required(),

  createdAt: joi.date().required(),
  createdBy: joi.string().required(),
});

const UserModuleValidation = joi.object({
  fkUserId: joi.string().uuid().required(),
  fkModuleId: joi.string().uuid().required(),
  accessDate: joi.date().required(),
  expiresAt: joi.date().required(),

  createdAt: joi.date().required(),
  createdBy: joi.string().required(),
});

const UserAppRoleValidation = joi.object({
  fkUserId: joi.string().uuid().required(),
  fkAppRoleId: joi.string().uuid().required(),
  fkModuleId: joi.string().uuid().required(),

  createdAt: joi.date().required(),
  createdBy: joi.string().required(),
});

const AppRolePermitValidation = joi.object({
  fkAppRoleId: joi.string().uuid().required(),
  fkMenuId: joi.string().uuid().required(),
  fkPermitId: joi.string().uuid().required(),

  createdAt: joi.date().required(),
  createdBy: joi.string().required(),
});

export = {
  ClearanceLevelValidation,
  AppRoleValidation,
  MenuValidation,
  ModuleValidation,
  PermitValidation,
  UserModuleValidation,
  UserAppRoleValidation,
  AppRolePermitValidation,
};