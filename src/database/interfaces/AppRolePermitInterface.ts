export default interface AppRolePermitInterface {
  appRolePermitId?: string;
  fkAppRoleId: string;
  fkMenuId: string;
  fkPermitId: string;

  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
}