export default interface UserAppRoleInterface {
  userAppRoleId?: string;
  fkUserId: string;
  fkAppRoleId: string;
  fkModuleId: string;

  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
}