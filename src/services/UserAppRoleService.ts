import { ModelStatic, Op } from "sequelize";
import UserAppRoleModel from "../database/models/UserAppRoleModel";
import UserAppRoleInterface from "../database/interfaces/UserAppRoleInterface";
import Response from "../utils/Response";
import CreateValidationSchema from "./validations/CreateValidationSchema";
import UpdateValidationSchema from "./validations/UpdateValidationSchema";
import { JwtPayload } from "../middlewares/Authentication";
import GrantGuard, { GrantDenial } from "./GrantGuard";

class UserAppRoleService {
  private model: ModelStatic<UserAppRoleModel> = UserAppRoleModel;

  /**
   * Confere se o ator pode atribuir/retirar a role ao usuário no módulo (regra do criador):
   * usuário alvo de nível estritamente menor; módulo e permissões da role contidos nos do ator.
   */
  private async guard(actor: JwtPayload, link: { fkUserId: string; fkModuleId: string; fkAppRoleId: string }): Promise<GrantDenial> {
    return (await GrantGuard.canManageUser(actor, link.fkUserId)) ?? (await GrantGuard.canGrantAccess(actor, link));
  }

  async createUserAppRole(data: UserAppRoleInterface, actor: JwtPayload) {
    data.createdAt = new Date();
    const { error } = CreateValidationSchema.UserAppRoleValidation.validate(data);
    if (error) return Response.badRequest(error.message);

    const denied = await this.guard(actor, data);
    if (denied) return denied;

    await this.model.create({ ...data });
    return Response.created("Vínculo de papel ao usuário criado com sucesso!");
  }

  async updateUserAppRole(id: string, data: Partial<UserAppRoleInterface>, actor: JwtPayload) {
    if(!id) return Response.badRequest("ID não informado");
    data.updatedAt = new Date();

    const { error } = UpdateValidationSchema.UpdateValidation.validate(data);    
    if (error) return Response.badRequest(error.message);

    const current = await this.model.findByPk(id);
    if (!current) return Response.notFound("Vínculo de papel não encontrado!");
    // Vale para o vínculo atual (não mexer no que está acima do ator) e para o resultado final.
    const denied = (await this.guard(actor, current)) ?? (await this.guard(actor, { ...current.get(), ...data }));
    if (denied) return denied;

    const [updated] = await this.model.update(data, {
      where: { userAppRoleId: id },
    });

    if (!updated) return Response.notFound("Vínculo de papel não encontrado!");

    const result = await this.model.findByPk(id);
    return Response.ok("Vínculo de papel atualizado com sucesso!", result);
  }

  async deleteUserAppRole(id: string, actor: JwtPayload) {
    const current = await this.model.findByPk(id);
    if (!current) return Response.notFound("Vínculo de papel não encontrado!");
    const denied = await this.guard(actor, current);
    if (denied) return denied;

    const deleted = await this.model.destroy({
      where: { userAppRoleId: id },
    });

    if (!deleted) return Response.notFound("Vínculo de papel não encontrado!");
    return Response.ok("Vínculo de papel removido com sucesso!");
  }

  async getUserAppRole(id: string) {
    if (!id) return Response.badRequest("ID não informado.");

    const result = await this.model.findByPk(id);
    if (!result) return Response.notFound("Vínculo de papel não encontrado!");

    return Response.ok("Vínculo de papel encontrado!", result);
  }

  async findUserAppRoles(query: {
    fkUserId?: string;
    fkAppRoleId?: string;
    fkModuleId?: string;
  }) {
    const where: any = {};

    if (query.fkUserId) {
      where.fkUserId = query.fkUserId;
    }
    if (query.fkAppRoleId) {
      where.fkAppRoleId = query.fkAppRoleId;
    }
    if (query.fkModuleId) {
      where.fkModuleId = query.fkModuleId;
    }

    const result = await this.model.findAll({ where });

    if (!result.length) {
      return Response.notFound("Nenhum vínculo encontrado com os filtros fornecidos.");
    }

    return Response.ok("Vínculos encontrados com sucesso", result);
  }
}

export default UserAppRoleService;
