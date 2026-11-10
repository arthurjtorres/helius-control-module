import { ModelStatic, Op } from "sequelize";
import ModuleModel from "../database/models/ModuleModel";
import MenuModel from "../database/models/MenuModel";
import ModuleInterface from "../database/interfaces/ModuleInterface";
import Response from "../utils/Response";
import CreateValidationSchema from "./validations/CreateValidationSchema";
import UpdateValidationSchema from "./validations/UpdateValidationSchema";

class ModuleService {
  private model: ModelStatic<ModuleModel> = ModuleModel;

  async createModule(data: ModuleInterface) {
    data.createdAt = new Date();
    const { error } = CreateValidationSchema.ModuleValidation.validate(data);
    if (error) return Response.badRequest(error.message);

    await this.model.create({ ...data });
    return Response.created("Módulo criado com sucesso!");
  }

  async updateModule(id: string, data: Partial<ModuleInterface>) {
    if(!id) return Response.badRequest("ID não informado");
    data.updatedAt = new Date();

    const { error } = UpdateValidationSchema.UpdateValidation.validate(data);    
    if (error) return Response.badRequest(error.message);

    const [updated] = await this.model.update(data, {
      where: { moduleId: id, activated: true }
    });

    if (!updated) return Response.notFound("Módulo não encontrado!");

    const result = await this.model.findByPk(id);
    return Response.ok("Módulo atualizado com sucesso!", result);
  }

  /**
   * Desativa o registro (exclusão lógica): `activated = false`.
   * @param id Identificador do registro.
   * @param updatedBy Usuário autenticado que executa a operação.
   */
  async deleteModule(id: string, updatedBy: string) {
    if (!id) return Response.badRequest("ID não informado");

    const activeMenus = await MenuModel.count({ where: { fkModuleId: id, activated: true } });
    if (activeMenus > 0) {
      return Response.conflict("Não é possível desativar: o módulo possui menus ativos.");
    }

    const [updated] = await this.model.update(
      { activated: false, updatedBy, updatedAt: new Date() },
      { where: { moduleId: id, activated: true } }
    );

    if (!updated) return Response.notFound("Módulo não encontrado!");
    return Response.ok("Módulo desativado com sucesso!");
  }

  /**
   * Reativa um registro desativado (`activated = true`).
   * @param id Identificador do registro.
   * @param updatedBy Usuário autenticado que executa a operação.
   */
  async reactivateModule(id: string, updatedBy: string) {
    if (!id) return Response.badRequest("ID não informado");

    const [updated] = await this.model.update(
      { activated: true, updatedBy, updatedAt: new Date() },
      { where: { moduleId: id, activated: false } }
    );

    if (!updated) return Response.notFound("Módulo não encontrado ou já ativo!");
    return Response.ok("Módulo reativado com sucesso!");
  }

  async getModule(id: string) {
    if (!id) return Response.badRequest("ID do módulo não informado.");

    const result = await this.model.findOne({ where: { moduleId: id, activated: true } });
    if (!result) return Response.notFound("Módulo não encontrado!");
    return Response.ok("Módulo encontrado!", result);
  }

  async findModules(query: { moduleName?: string }) {
    const where: any = { activated: true };

    if (query.moduleName) {
      where.moduleName = { [Op.iLike]: `%${query.moduleName}%` };
    }

    const result = await this.model.findAll({ where });

    if (!result.length) {
      return Response.notFound("Nenhum módulo encontrado com os filtros fornecidos.");
    }

    return Response.ok("Módulos encontrados com sucesso", result);
  }
}

export default ModuleService;
