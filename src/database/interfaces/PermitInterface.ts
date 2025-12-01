export default interface PermitInterface {
  permitId?: string; 
  permitName: string;

  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
}