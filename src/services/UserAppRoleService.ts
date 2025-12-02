import { ModelStatic, Op } from "sequelize";
import UserAppRoleModel from "../database/models/UserAppRoleModel";
import UserAppRoleInterface from "../database/interfaces/UserAppRoleInterface";
import Response from "../utils/Response";
import CreateValidationSchema from "./validations/CreateValidationSchema";
import UpdateValidationSchema from "./validations/UpdateValidationSchema";

class UserAppRoleService {
  private model: ModelStatic<UserAppRoleModel> = UserAppRoleModel;

  async createUserAppRole(data: UserAppRoleInterface) {
    data.createdAt = new Date();
    const { error } = CreateValidationSchema.UserAppRoleValidation.validate(data);
    if (error) return Response.badRequest(error.message);

    await this.model.create({ ...data });
    return Response.created("Vínculo de papel ao usuário criado com sucesso!");
  }

  async updateUserAppRole(id: string, data: Partial<UserAppRoleInterface>) {
    if(!id) return Response.badRequest("ID não informado");
    data.updatedAt = new Date();

    const { error } = UpdateValidationSchema.UpdateValidation.validate(data);    
    if (error) return Response.badRequest(error.message);

    const [updated] = await this.model.update(data, {
      where: { userAppRoleId: id },
    });

    if (!updated) return Response.notFound("Vínculo de papel não encontrado!");

    const result = await this.model.findByPk(id);
    return Response.ok("Vínculo de papel atualizado com sucesso!", result);
  }

  async deleteUserAppRole(id: string) {
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
