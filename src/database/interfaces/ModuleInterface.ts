export default interface ModuleInterface {
  moduleId?: string;
  moduleName: string;
  moduleDescription: string;

  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
}