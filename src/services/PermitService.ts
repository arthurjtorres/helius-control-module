import { ModelStatic, Op } from "sequelize";
import PermitModel from "../database/models/PermitModel";
import PermitInterface from "../database/interfaces/PermitInterface";
import Response from "../utils/Response";
import CreateValidationSchema from "./validations/CreateValidationSchema";
import UpdateValidationSchema from "./validations/UpdateValidationSchema";

class PermitService {
  private model: ModelStatic<PermitModel> = PermitModel;

  async createPermit(data: PermitInterface) {
    data.createdAt = new Date();
    const { error } = CreateValidationSchema.PermitValidation.validate(data);
    if (error) return Response.badRequest(error.message);

    await this.model.create({ ...data });
    return Response.created("Permissão criada com sucesso!");
  }

  async updatePermit(id: string, data: Partial<PermitInterface>) {
    if(!id) return Response.badRequest("ID não informado");
    data.updatedAt = new Date();

    const { error } = UpdateValidationSchema.UpdateValidation.validate(data);    
    if (error) return Response.badRequest(error.message);

    const [updated] = await this.model.update(data, {
      where: { permitId: id }
    });

    if (!updated) return Response.notFound("Permissão não encontrada!");

    const result = await this.model.findByPk(id);
    return Response.ok("Permissão atualizada com sucesso!", result);
  }

  async deletePermit(id: string) {
    const deleted = await this.model.destroy({ where: { permitId: id } });

    if (!deleted) return Response.notFound("Permissão não encontrada!");
    return Response.ok("Permissão deletada com sucesso!");
  }

  async getPermit(id: string) {
    if (!id) return Response.badRequest("ID da permissão não informado.");

    const result = await this.model.findByPk(id);
    if (!result) return Response.notFound("Permissão não encontrada!");
    return Response.ok("Permissão encontrada!", result);
  }

  async findPermits(query: Partial<Pick<PermitInterface, 'permitName'>>) {
    const where: any = {};

    if (query.permitName) {
      where.permitName = { [Op.iLike]: `%${query.permitName}%` };
    }

    const result = await this.model.findAll({ where });

    if (!result.length) {
      return Response.notFound("Nenhuma permissão encontrada com os filtros fornecidos.");
    }

    return Response.ok("Permissões encontradas com sucesso", result);
  }
}

export default PermitService;
