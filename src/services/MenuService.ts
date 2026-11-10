import { ModelStatic, Op } from "sequelize";
import MenuModel from "../database/models/MenuModel";
import ModuleModel from "../database/models/ModuleModel";
import MenuInterface from "../database/interfaces/MenuInterface";
import Response from "../utils/Response";
import CreateValidationSchema from "./validations/CreateValidationSchema";
import UpdateValidationSchema from "./validations/UpdateValidationSchema";

class MenuService {
  private model: ModelStatic<MenuModel> = MenuModel;

  async createMenu(data: MenuInterface) {
    data.createdAt = new Date();
    const { error } = CreateValidationSchema.MenuValidation.validate(data);
    if (error) return Response.badRequest(error.message);

    await this.model.create({ ...data });
    return Response.created("Menu criado com sucesso!");
  }

  async updateMenu(id: string, data: Partial<MenuInterface>) {
    if(!id) return Response.badRequest("ID não informado");
    data.updatedAt = new Date();

    const { error } = UpdateValidationSchema.UpdateValidation.validate(data);    
    if (error) return Response.badRequest(error.message);

    const [updated] = await this.model.update(data, {
      where: { menuId: id, activated: true }
    });

    if (!updated) return Response.notFound("Menu não encontrado!");

    const result = await this.model.findByPk(id, {
      include: [{ model: ModuleModel }]
    });

    return Response.ok("Menu atualizado com sucesso!", result);
  }

  /**
   * Desativa o registro (exclusão lógica): `activated = false`.
   * @param id Identificador do registro.
   * @param updatedBy Usuário autenticado que executa a operação.
   */
  async deleteMenu(id: string, updatedBy: string) {
    if (!id) return Response.badRequest("ID não informado");

    const [updated] = await this.model.update(
      { activated: false, updatedBy, updatedAt: new Date() },
      { where: { menuId: id, activated: true } }
    );

    if (!updated) return Response.notFound("Menu não encontrado!");
    return Response.ok("Menu desativado com sucesso!");
  }

  /**
   * Reativa um registro desativado (`activated = true`).
   * @param id Identificador do registro.
   * @param updatedBy Usuário autenticado que executa a operação.
   */
  async reactivateMenu(id: string, updatedBy: string) {
    if (!id) return Response.badRequest("ID não informado");

    const [updated] = await this.model.update(
      { activated: true, updatedBy, updatedAt: new Date() },
      { where: { menuId: id, activated: false } }
    );

    if (!updated) return Response.notFound("Menu não encontrado ou já ativo!");
    return Response.ok("Menu reativado com sucesso!");
  }

  async getMenu(id: string) {
    if (!id) return Response.badRequest("ID do menu não informado.");

    const result = await this.model.findOne({
      where: { menuId: id, activated: true },
      include: [{ model: ModuleModel }]
    });

    if (!result) return Response.notFound("Menu não encontrado!");
    return Response.ok("Menu encontrado!", result);
  }

  async findMenus(query: { menuName?: string; fkModuleId?: string }) {
    const where: any = { activated: true };

    if (query.menuName) {
      where.menuName = { [Op.iLike]: `%${query.menuName}%` };
    }

    if (query.fkModuleId) {
      where.fkModuleId = query.fkModuleId;
    }

    const result = await this.model.findAll({
      where,
      include: [{ model: ModuleModel }]
    });

    if (!result.length) {
      return Response.notFound("Nenhum menu encontrado com os filtros fornecidos.");
    }

    return Response.ok("Menus encontrados com sucesso", result);
  }
}

export default MenuService;
