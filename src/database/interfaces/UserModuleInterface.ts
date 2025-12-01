export default interface UserModuleInterface {
  userModuleId?: string; 
  fkUserId: string;
  fkModuleId: string;
  accessDate: Date;
  expiresAt: Date;

  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
}