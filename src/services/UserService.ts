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
import bcrypt from "bcrypt";
import db from "../database/models/index"
import UserAppRoleModel from "../database/models/UserAppRoleModel";
import AppRoleModel from "../database/models/AppRoleModel";
import ModuleModel from "../database/models/ModuleModel";

class UserService {
  private model: ModelStatic<UserModel> = UserModel;

  async createUser(data: UserInterface) {
    // 1. Validação ANTES de abrir transação (Economiza recursos)
    data.createdAt = new Date();
    const { error } = UserValidation.validate(data);
    if (error) return Response.badRequest(error.message);

    const transaction = await db.transaction();
    try {
      const hashPassword = await bcrypt.hash(data.password, 10);

      const createdUser = await this.model.create(
        { ...data, password: hashPassword },
        { transaction }
      );

      if (data.userType === UserTypeEnum.COLABORADOR) {
        if (!data.fkEmployeeId) {
          // Se falhar aqui, o rollback desfaz o UserModel.create
          await transaction.rollback();
          return Response.badRequest("fkEmployeeId é obrigatório para COLABORADOR.");
        }

        await EmployeeUserModel.create({
          fkUserId: createdUser.userId,
          fkEmployeeId: data.fkEmployeeId,
          createdBy: data.createdBy, // Adicione esta linha
          activated: true            // Boa prática garantir o estado inicial
        }, { transaction });
      }

      if (data.userType === UserTypeEnum.EXTERNO) {
        if (!data.fkPersonId) {
          await transaction.rollback();
          return Response.badRequest("fkPersonId é obrigatório para EXTERNO.");
        }

        await ExternalUserModel.create({
          fkUserId: createdUser.userId,
          fkPersonId: data.fkPersonId,
          createdBy: data.createdBy, // Adicione esta linha
          activated: true            // Boa prática garantir o estado inicial
        }, { transaction });
      }

      await transaction.commit(); // Se tudo deu certo, salva no banco
      return Response.created("Usuário Cadastrado!");

    } catch (error: any) {
      await transaction.rollback(); // Se algo falhou, desfaz TUDO
      console.error("Erro no createUser:", error);
      return Response.internalError(error.message || "Erro inesperado ao criar usuário");
    }
  }

  async updateUser(userId: string, data: Partial<UserInterface>) {
    if (!userId) return Response.badRequest("ID do usuário não informado");

    data.updatedAt = new Date();

    const { error } = UpdateValidationSchema.UpdateUserValidation.validate(data);
    if (error) return Response.badRequest(error.message);

    const transaction = await db.transaction();
    try {
      if (data.password) data.password = await bcrypt.hash(data.password, 10);

      const [updated] = await this.model.update(data, { where: { userId }, transaction });

      if (!updated) {
        await transaction.rollback();
        return Response.notFound("Usuário não encontrado para atualização!");
      }

      await transaction.commit();
      const result = await this.model.findByPk(userId, {
        attributes: { exclude: ['password'] }
      });
      return Response.ok("Usuário atualizado com sucesso!", result);

    } catch (error: any) {
      await transaction.rollback();
      return Response.internalError(error.message);

    }
  }

  async deleteUser(userId: string) {
    if (!userId) return Response.badRequest("ID do usuário não informado.");

    const transaction = await db.transaction();
    try {
      const deleted = await this.model.destroy({ where: { userId }, transaction });
      if (!deleted) {
        await transaction.rollback();
        return Response.notFound("Usuário não encontrado para exclusão!");
      }

      await transaction.commit();
      return Response.ok("Usuário deletado com sucesso");
    } catch (error: any) {
      await transaction.rollback();
      return Response.internalError("Falha na exclusão: " + error.message);
    }
  }

  // Métodos de consulta não utilizam transaction por padrão (performance)
  async getUser(userId: string) {
    if (!userId) return Response.badRequest("ID do usuário não informado.");

    try {
      const result = await this.model.findByPk(userId, {
        include: [
          { model: EmployeeUserModel, as: 'employeeLink' },
          { model: ExternalUserModel, as: 'externalLink' },
          {
            model: UserAppRoleModel,
            as: 'userAppRoles',
            include: [
              { model: AppRoleModel, as: 'role' },
              { model: ModuleModel, as: 'module' },
            ]
          },

        ],
      });

      if (!result) return Response.notFound("Usuário não encontrado!");

      const enrichedUser = await enrichUserData(result.toJSON());
      return Response.ok("Usuário encontrado com sucesso!", enrichedUser);
    } catch (error: any) {
      return Response.internalError(error.message);
    }
  }

  async findUsers(query: { userName?: string; email?: string; userType?: UserTypeEnum }) {
    try {
      const where: any = {};
      if (query.userName) where.userName = { [Op.iLike]: `%${query.userName}%` };
      if (query.email) where.email = { [Op.iLike]: `%${query.email}%` };
      if (query.userType) where.userType = query.userType;

      const users = await this.model.findAll({
        where,
        include: [
          { model: EmployeeUserModel, as: 'employeeLink' },
          { model: ExternalUserModel, as: 'externalLink' },
          {
            model: UserAppRoleModel,
            as: 'userAppRoles',
            include: [
              { model: AppRoleModel, as: 'role' },
              { model: ModuleModel, as: 'module' },
            ]
          },

        ],
      });

      if (!users.length) return Response.notFound("Nenhum usuário encontrado.");

      const enriched = await Promise.all(users.map(u => enrichUserData(u.toJSON())));
      return Response.ok("Usuários encontrados com sucesso", enriched);
    } catch (error: any) {
      return Response.internalError(error.message);
    }
  }
}

export default UserService;