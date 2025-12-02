import { ModelStatic, Op } from "sequelize";
import ClearanceLevelModel from "../database/models/ClearanceLevelModel";
import ClearanceLevelInterface from "../database/interfaces/ClearanceLevelInterface";
import Response from "../utils/Response";
import CreateValidationSchema from "./validations/CreateValidationSchema";
import UpdateValidationSchema from "./validations/UpdateValidationSchema";

class ClearanceLevelService {
  private model: ModelStatic<ClearanceLevelModel> = ClearanceLevelModel;

  async createClearanceLevel(data: ClearanceLevelInterface) {
    data.createdAt = new Date();    
    const { error } = CreateValidationSchema.ClearanceLevelValidation.validate(data);

    if (error) return Response.badRequest(error.message);

    await this.model.create({ ...data });
    return Response.created("Nível de acesso criado com sucesso!");
  }

  async updateClearanceLevel(id: string, data: Partial<ClearanceLevelInterface>) {
    if(!id) return Response.badRequest("ID não informado");
    data.updatedAt = new Date();

    const { error } = UpdateValidationSchema.UpdateValidation.validate(data);    
    if (error) return Response.badRequest(error.message);

    const [updated] = await this.model.update(data, {
      where: { clearanceId: id },
    });

    if (!updated) return Response.notFound("Nível de acesso não encontrado!");

    const result = await this.model.findByPk(id);
    return Response.ok("Nível de acesso atualizado com sucesso!", result);
  }

  async deleteClearanceLevel(id: string) {
    const deleted = await this.model.destroy({
      where: { clearanceId: id },
    });

    if (!deleted) return Response.notFound("Nível de acesso não encontrado!");
    return Response.ok("Nível de acesso removido com sucesso!");
  }

  async getClearanceLevel(id: string) {
    if (!id) return Response.badRequest("ID não informado.");

    const result = await this.model.findByPk(id);
    if (!result) return Response.notFound("Nível de acesso não encontrado!");

    return Response.ok("Nível de acesso encontrado!", result);
  }

  async findClearanceLevels(query: Partial<Pick<ClearanceLevelInterface, 'clearanceName'>>) {
    const where: any = {};

    if (query.clearanceName) {
      where.clearanceName = { [Op.iLike]: `%${query.clearanceName}%` };
    }

    const result = await this.model.findAll({ where });

    if (!result.length) {
      return Response.notFound("Nenhum nível de acesso encontrado com os filtros fornecidos.");
    }

    return Response.ok("Níveis de acesso encontrados com sucesso", result);
  }
}

export default ClearanceLevelService;
