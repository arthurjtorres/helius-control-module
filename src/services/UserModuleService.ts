import { ModelStatic, Op } from "sequelize";
import UserModuleModel from "../database/models/UserModuleModel";
import UserModuleInterface from "../database/interfaces/UserModuleInterface";
import Response from "../utils/Response";
import CreateValidationSchema from "./validations/CreateValidationSchema";
import UpdateValidationSchema from "./validations/UpdateValidationSchema";
import { JwtPayload } from "../middlewares/Authentication";
import GrantGuard, { GrantDenial } from "./GrantGuard";

class UserModuleService {
  private model: ModelStatic<UserModuleModel> = UserModuleModel;

  /**
   * Confere se o ator pode dar/retirar o módulo ao usuário (regra do criador):
   * usuário alvo de nível estritamente menor e módulo que o próprio ator possui.
   */
  private async guard(actor: JwtPayload, link: { fkUserId: string; fkModuleId: string }): Promise<GrantDenial> {
    return (await GrantGuard.canManageUser(actor, link.fkUserId)) ?? (await GrantGuard.canGrantAccess(actor, { fkModuleId: link.fkModuleId }));
  }

  async createUserModule(data: UserModuleInterface, actor: JwtPayload) {
    data.createdAt = new Date();
    const { error } = CreateValidationSchema.UserModuleValidation.validate(data);
    if (error) return Response.badRequest(error.message);

    const denied = await this.guard(actor, data);
    if (denied) return denied;

    await this.model.create({ ...data });
    return Response.created("Vínculo de usuário ao módulo criado com sucesso!");
  }

  async updateUserModule(id: string, data: Partial<UserModuleInterface>, actor: JwtPayload) {
    if(!id) return Response.badRequest("ID não informado");
    data.updatedAt = new Date();

    const { error } = UpdateValidationSchema.UpdateValidation.validate(data);    
    if (error) return Response.badRequest(error.message);

    const current = await this.model.findByPk(id);
    if (!current) return Response.notFound("Vínculo não encontrado!");
    const denied = (await this.guard(actor, current)) ?? (await this.guard(actor, { ...current.get(), ...data }));
    if (denied) return denied;

    const [updated] = await this.model.update(data, {
      where: { userModuleId: id },
    });

    if (!updated) return Response.notFound("Vínculo não encontrado!");

    const result = await this.model.findByPk(id);
    return Response.ok("Vínculo atualizado com sucesso!", result);
  }

  async deleteUserModule(id: string, actor: JwtPayload) {
    const current = await this.model.findByPk(id);
    if (!current) return Response.notFound("Vínculo não encontrado!");
    const denied = await this.guard(actor, current);
    if (denied) return denied;

    const deleted = await this.model.destroy({
      where: { userModuleId: id },
    });

    if (!deleted) return Response.notFound("Vínculo não encontrado!");
    return Response.ok("Vínculo excluído com sucesso!");
  }

  async getUserModule(id: string) {
    if (!id) return Response.badRequest("ID não informado.");

    const result = await this.model.findByPk(id);
    if (!result) return Response.notFound("Vínculo não encontrado!");

    return Response.ok("Vínculo encontrado!", result);
  }

  async findUserModules(query: Partial<Pick<UserModuleInterface, 'fkUserId' | 'fkModuleId'>>) {
    const where: any = {};

    if (query.fkUserId) where.fkUserId = query.fkUserId;
    if (query.fkModuleId) where.fkModuleId = query.fkModuleId;

    const result = await this.model.findAll({ where });

    if (!result.length) {
      return Response.notFound("Nenhum vínculo encontrado com os filtros fornecidos.");
    }

    return Response.ok("Vínculos encontrados com sucesso", result);
  }
}

export default UserModuleService;
