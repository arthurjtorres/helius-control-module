export default interface ClearanceLevelInterface {
  clearanceId?: string; // gerado automaticamente
  clearanceName: string;

  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
}