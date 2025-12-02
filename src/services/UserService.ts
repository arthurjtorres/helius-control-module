import { ModelStatic, Op } from "sequelize";
import UserModel from "../database/models/UserModel";
import UserInterface from "../database/interfaces/UserInterface";
import UserValidation from "./validations/UserValidation";
import UpdateValidationSchema from "./validations/UpdateValidationSchema";
import Response from "../utils/Response";
import { UserTypeEnum } from "../database/models/enums/UserTypeEnum";
import EmployeeUserModel from "../database/models/EmployeeUserModel";
import ExternalUserModel from "../database/models/ExternalUserModel";
import { enrichUserData } from "../services/integrations/UserAggregator";
import md5 from "md5";

// Importa cliente de serviço, que pode ser local ou HTTP
import { getEmployeeById } from "./integrations/EmployeeService";
import { getPersonById } from "./integrations/PersonService";

class UserService {
  private model: ModelStatic<UserModel> = UserModel;

  async createUser(data: UserInterface) {
    try {
      const hashPassword = md5(data.password);
      data.createdAt = new Date();
      const { error } = UserValidation.validate(data);
      if (error) return Response.badRequest(error.message);

      const createdUser = await this.model.create({ ...data, password: hashPassword });

      if (data.userType === UserTypeEnum.COLABORADOR) {
        if (!data.fkEmployeeId) {
          return Response.badRequest("fkEmployeeId é obrigatório para COLABORADOR.");
        }

        await EmployeeUserModel.create({
          fkUserId: createdUser.userId,
          fkEmployeeId: data.fkEmployeeId,
        });
      }

      if (data.userType === UserTypeEnum.EXTERNO && data.fkPersonId) {
        await ExternalUserModel.create({
          fkUserId: createdUser.userId,
          fkPersonId: data.fkPersonId,
        });
      }

      return Response.created("Usuário Cadastrado!");
    } catch (error: any) {
      console.error("Erro no createUser:", error);
      return Response.internalError(error.message || "Erro ao criar usuário");
    }
  }

  async updateUser(userId: string, data: Partial<UserInterface>) {
    if (!userId) return Response.badRequest("ID do usuário não informado");

    if (data.password) {
      data.password = md5(data.password);
    }
    data.updatedAt = new Date();

    const { error } = UpdateValidationSchema.UpdateValidation.validate(data);
    if (error) return Response.badRequest(error.message);

    const [updated] = await this.model.update(data, { where: { userId } });
    if (!updated) return Response.notFound("Usuário não encontrado!");

    const result = await this.model.findByPk(userId);
    return Response.ok("Usuário atualizado com sucesso!", result);
  }

  async deleteUser(userId: string) {
    if (!userId) return Response.badRequest("ID do usuário não informado.");

    const deleted = await this.model.destroy({ where: { userId } });
    if (!deleted) return Response.notFound("Usuário não encontrado!");

    return Response.ok("Usuário deletado com sucesso");
  }

  async getUser(userId: string) {
    if (!userId) return Response.badRequest("ID do usuário não informado.");

    const result = await this.model.findByPk(userId, {
      include: [
        {
          model: EmployeeUserModel,
          as: 'employeeLink',
        },
        {
          model: ExternalUserModel,
          as: 'externalLink',
        },
      ],
    });

    if (!result) return Response.notFound("Usuário não encontrado!");

    const enrichedUser = await enrichUserData(result.toJSON());

    return Response.ok("Usuário encontrado com sucesso!", enrichedUser);
  }

  async findUsers(query: {
    userName?: string;
    email?: string;
    userType?: UserTypeEnum;
  }) {
    const where: any = {};

    if (query.userName) {
      where.userName = { [Op.iLike]: `%${query.userName}%` };
    }
    if (query.email) {
      where.email = { [Op.iLike]: `%${query.email}%` };
    }
    if (query.userType) {
      where.userType = query.userType;
    }

    const users = await this.model.findAll({
      where,
      include: [
        { model: EmployeeUserModel, as: 'employeeLink' },
        { model: ExternalUserModel, as: 'externalLink' },
      ],
    });

    if (!users.length) {
      return Response.notFound("Nenhum usuário encontrado com os filtros fornecidos.");
    }

    // Enriquecendo em paralelo
    const enriched = await Promise.all(
      users.map(u => enrichUserData(u.toJSON()))
    );

    return Response.ok("Usuários encontrados com sucesso", enriched);
  }
}

export default UserService;
