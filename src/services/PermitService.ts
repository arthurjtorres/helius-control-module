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

    const { error } = UpdateValidationSchema.UpdatePermitValidation.validate(data);    
    if (error) return Response.badRequest(error.message);

    const [updated] = await this.model.update(data, {
      where: { permitId: id, activated: true }
    });

    if (!updated) return Response.notFound("Permissão não encontrada!");

    const result = await this.model.findByPk(id);
    return Response.ok("Permissão atualizada com sucesso!", result);
  }

  /**
   * Desativa o registro (exclusão lógica): `activated = false`.
   * @param id Identificador do registro.
   * @param updatedBy Usuário autenticado que executa a operação.
   */
  async deletePermit(id: string, updatedBy: string) {
    if (!id) return Response.badRequest("ID não informado");

    const [updated] = await this.model.update(
      { activated: false, updatedBy, updatedAt: new Date() },
      { where: { permitId: id, activated: true } }
    );

    if (!updated) return Response.notFound("Permissão não encontrada!");
    return Response.ok("Permissão desativada com sucesso!");
  }

  /**
   * Reativa um registro desativado (`activated = true`).
   * @param id Identificador do registro.
   * @param updatedBy Usuário autenticado que executa a operação.
   */
  async reactivatePermit(id: string, updatedBy: string) {
    if (!id) return Response.badRequest("ID não informado");

    const [updated] = await this.model.update(
      { activated: true, updatedBy, updatedAt: new Date() },
      { where: { permitId: id, activated: false } }
    );

    if (!updated) return Response.notFound("Permissão não encontrada ou já ativo!");
    return Response.ok("Permissão reativada com sucesso!");
  }

  async getPermit(id: string) {
    if (!id) return Response.badRequest("ID da permissão não informado.");

    const result = await this.model.findOne({ where: { permitId: id, activated: true } });
    if (!result) return Response.notFound("Permissão não encontrada!");
    return Response.ok("Permissão encontrada!", result);
  }

  async findPermits(query: Partial<Pick<PermitInterface, 'permitName'>>) {
    const where: any = { activated: true };

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
