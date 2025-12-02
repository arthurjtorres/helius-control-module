import { ModelStatic, Op } from "sequelize";
import UserModuleModel from "../database/models/UserModuleModel";
import UserModuleInterface from "../database/interfaces/UserModuleInterface";
import Response from "../utils/Response";
import CreateValidationSchema from "./validations/CreateValidationSchema";
import UpdateValidationSchema from "./validations/UpdateValidationSchema";

class UserModuleService {
  private model: ModelStatic<UserModuleModel> = UserModuleModel;

  async createUserModule(data: UserModuleInterface) {
    data.createdAt = new Date();
    const { error } = CreateValidationSchema.UserModuleValidation.validate(data);
    if (error) return Response.badRequest(error.message);

    await this.model.create({ ...data });
    return Response.created("Vínculo de usuário ao módulo criado com sucesso!");
  }

  async updateUserModule(id: string, data: Partial<UserModuleInterface>) {
    if(!id) return Response.badRequest("ID não informado");
    data.updatedAt = new Date();

    const { error } = UpdateValidationSchema.UpdateValidation.validate(data);    
    if (error) return Response.badRequest(error.message);

    const [updated] = await this.model.update(data, {
      where: { userModuleId: id },
    });

    if (!updated) return Response.notFound("Vínculo não encontrado!");

    const result = await this.model.findByPk(id);
    return Response.ok("Vínculo atualizado com sucesso!", result);
  }

  async deleteUserModule(id: string) {
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
