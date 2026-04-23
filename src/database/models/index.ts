import db from "./database";
import { setupAssociations } from "./associations";

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

setupAssociations();

export default db;

export {
AppRoleModel,
AppRolePermitModel,
ClearanceLevelModel,
EmployeeUserModel,
ExternalUserModel,
MenuModel,
ModuleModel,
PermitModel,
UserAppRoleModel,
UserModel,
UserModuleModel,
}
