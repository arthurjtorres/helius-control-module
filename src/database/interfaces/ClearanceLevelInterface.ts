export default interface ClearanceLevelInterface {
  clearanceId?: string; 
  clearanceName: string;

  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
}