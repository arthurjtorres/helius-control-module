import { ModelStatic, Op } from "sequelize";
import AppRoleModel from "../database/models/AppRoleModel";
import AppRoleInterface from "../database/interfaces/AppRoleInterface";
import Response from "../utils/Response";
import CreateValidationSchema from "./validations/CreateValidationSchema";
import UpdateValidationSchema from "./validations/UpdateValidationSchema";

class AppRoleService {
  private model: ModelStatic<AppRoleModel> = AppRoleModel;

  async createAppRole(data:AppRoleInterface) {
    data.createdAt = new Date();
    const { error } = CreateValidationSchema.AppRoleValidation.validate(data);
    if (error) return Response.badRequest(error.message);

    await this.model.create({...data});
    return Response.created("Função de aplicativo criada com sucesso!");
  }

  async updateAppRole(id: string, data: Partial<AppRoleInterface>) {
    if(!id) return Response.badRequest("ID não informado");
    data.updatedAt = new Date();

    const { error } = UpdateValidationSchema.UpdateValidation.validate(data);
    if (error) return Response.badRequest(error.message);

    const [updated] = await this.model.update(data, {
      where: { appRoleId: id }
    });

    if (!updated) return Response.notFound("Função não encontrada!");

    const result = await this.model.findByPk(id);
    return Response.ok("Função atualizada com sucesso!", result);
  }

  async deleteAppRole(id: string) {
    const deleted = await this.model.destroy({ where: { appRoleId: id } });

    if (!deleted) return Response.notFound("Função não encontrada!");
    return Response.ok("Função deletada com sucesso!");
  }

  async getAppRole(id: string) {
    if (!id) return Response.badRequest("ID da função não informado.");

    const result = await this.model.findByPk(id);
    if (!result) return Response.notFound("Função não encontrada!");
    return Response.ok("Função encontrada!", result);
  }

  async findAppRoles(query: { appRoleName?: string }) {
    const where: any = {};

    if (query.appRoleName) {
      where.appRoleName = { [Op.iLike]: `%${query.appRoleName}%` };
    }

    const result = await this.model.findAll({ where });

    if (!result.length) {
      return Response.notFound("Nenhuma função encontrada com os filtros fornecidos.");
    }

    return Response.ok("Funções encontradas com sucesso", result);
  }
}

export default AppRoleService;
