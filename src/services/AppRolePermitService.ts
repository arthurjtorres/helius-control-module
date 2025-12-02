import { ModelStatic, Op } from "sequelize";
import AppRolePermitModel from "../database/models/AppRolePermitModel";
import AppRolePermitInterface from "../database/interfaces/AppRolePermitInterface";
import Response from "../utils/Response";
import CreateValidationSchema from "./validations/CreateValidationSchema";
import UpdateValidationSchema from "./validations/UpdateValidationSchema";

class AppRolePermitService {
  private model: ModelStatic<AppRolePermitModel> = AppRolePermitModel;

  async createAppRolePermit(data: AppRolePermitInterface) {
    data.createdAt = new Date();
    const { error } = CreateValidationSchema.AppRolePermitValidation.validate(data);
    
    if (error) return Response.badRequest(error.message);

    await this.model.create({ ...data });
    return Response.created("Permissão atribuída ao papel com sucesso!");
  }

  async updateAppRolePermit(id: string, data: Partial<AppRolePermitInterface>) {
    if(!id) return Response.badRequest("ID não informado");
    data.updatedAt = new Date();

    const { error } = UpdateValidationSchema.UpdateValidation.validate(data);    
    if (error) return Response.badRequest(error.message);

    const [updated] = await this.model.update(data, {
      where: { appRolePermitId: id }
    });

    if (!updated) return Response.notFound("Associação não encontrada!");

    const result = await this.model.findByPk(id);
    return Response.ok("Associação atualizada com sucesso!", result);
  }

  async deleteAppRolePermit(id: string) {
    const deleted = await this.model.destroy({
      where: { appRolePermitId: id }
    });

    if (!deleted) return Response.notFound("Associação não encontrada!");
    return Response.ok("Associação removida com sucesso!");
  }

  async getAppRolePermit(id: string) {
    if (!id) return Response.badRequest("ID não informado");

    const result = await this.model.findByPk(id);
    if (!result) return Response.notFound("Associação não encontrada!");

    return Response.ok("Associação encontrada!", result);
  }

  async findAppRolePermits(query: {
    fkAppRoleId?: string;
    fkMenuId?: string;
    fkPermitId?: string;
  }) {
    const where: any = {};

    if (query.fkAppRoleId) where.fkAppRoleId = query.fkAppRoleId;
    if (query.fkMenuId) where.fkMenuId = query.fkMenuId;
    if (query.fkPermitId) where.fkPermitId = query.fkPermitId;

    const result = await this.model.findAll({ where });

    if (!result.length) {
      return Response.notFound("Nenhuma permissão vinculada encontrada.");
    }

    return Response.ok("Permissões vinculadas encontradas com sucesso", result);
  }
}

export default AppRolePermitService;
