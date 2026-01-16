import { PermissionEnum } from "../models/enums/PermissionEnum";

export default interface PermitInterface {
  permitId?: string; 
  permitName: string;
  permitList: PermissionEnum[];

  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
}