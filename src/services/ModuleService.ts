import { ModelStatic, Op } from "sequelize";
import ModuleModel from "../database/models/ModuleModel";
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
      where: { moduleId: id }
    });

    if (!updated) return Response.notFound("Módulo não encontrado!");

    const result = await this.model.findByPk(id);
    return Response.ok("Módulo atualizado com sucesso!", result);
  }

  async deleteModule(id: string) {
    const deleted = await this.model.destroy({
      where: { moduleId: id }
    });

    if (!deleted) return Response.notFound("Módulo não encontrado!");
    return Response.ok("Módulo deletado com sucesso!");
  }

  async getModule(id: string) {
    if (!id) return Response.badRequest("ID do módulo não informado.");

    const result = await this.model.findByPk(id);
    if (!result) return Response.notFound("Módulo não encontrado!");
    return Response.ok("Módulo encontrado!", result);
  }

  async findModules(query: { moduleName?: string }) {
    const where: any = {};

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
