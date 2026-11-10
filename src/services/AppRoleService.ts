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
      where: { appRoleId: id, activated: true }
    });

    if (!updated) return Response.notFound("Função não encontrada!");

    const result = await this.model.findByPk(id);
    return Response.ok("Função atualizada com sucesso!", result);
  }

  /**
   * Desativa o registro (exclusão lógica): `activated = false`.
   * @param id Identificador do registro.
   * @param updatedBy Usuário autenticado que executa a operação.
   */
  async deleteAppRole(id: string, updatedBy: string) {
    if (!id) return Response.badRequest("ID não informado");

    const [updated] = await this.model.update(
      { activated: false, updatedBy, updatedAt: new Date() },
      { where: { appRoleId: id, activated: true } }
    );

    if (!updated) return Response.notFound("Função não encontrada!");
    return Response.ok("Função desativada com sucesso!");
  }

  /**
   * Reativa um registro desativado (`activated = true`).
   * @param id Identificador do registro.
   * @param updatedBy Usuário autenticado que executa a operação.
   */
  async reactivateAppRole(id: string, updatedBy: string) {
    if (!id) return Response.badRequest("ID não informado");

    const [updated] = await this.model.update(
      { activated: true, updatedBy, updatedAt: new Date() },
      { where: { appRoleId: id, activated: false } }
    );

    if (!updated) return Response.notFound("Função não encontrada ou já ativo!");
    return Response.ok("Função reativada com sucesso!");
  }

  async getAppRole(id: string) {
    if (!id) return Response.badRequest("ID da função não informado.");

    const result = await this.model.findOne({ where: { appRoleId: id, activated: true } });
    if (!result) return Response.notFound("Função não encontrada!");
    return Response.ok("Função encontrada!", result);
  }

  async findAppRoles(query: { appRoleName?: string }) {
    const where: any = { activated: true };

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
