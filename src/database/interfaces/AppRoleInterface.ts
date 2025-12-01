export default interface AppRoleInterface {
  appRoleId?: string;
  appRoleName: string;

  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
}