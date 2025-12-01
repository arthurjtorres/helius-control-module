import { UserTypeEnum } from "../models/enums/UserTypeEnum";

export default interface UserInterface {
  userId?: string;
  userName: string;
  email: string;
  password: string;
  userType: UserTypeEnum;
  fkClearanceId: string;
  fkEmployeeId?: string;
  fkPersonId?: string;

  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
}