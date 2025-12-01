export default interface MenuInterface {
  menuId?: string;
  menuName: string;
  fkModuleId: string;

  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
}