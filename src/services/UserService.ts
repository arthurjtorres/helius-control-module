import { ModelStatic, Op } from "sequelize";
import UserModel from "../database/models/UserModel";
import UserInterface from "../database/interfaces/UserInterface";
import UserValidation from "./validations/UserValidation";
import UpdateValidationSchema from "./validations/UpdateValidationSchema";
import Response from "../utils/Response";
import { logError } from "../utils/logError";
import { UserTypeEnum } from "../database/models/enums/UserTypeEnum";
import EmployeeUserModel from "../database/models/EmployeeUserModel";
import ExternalUserModel from "../database/models/ExternalUserModel";
import { enrichUserData } from "../services/integrations/UserAggregator";
import bcrypt from "bcrypt";
import db from "../database/models/index"
import UserAppRoleModel from "../database/models/UserAppRoleModel";
import AppRoleModel from "../database/models/AppRoleModel";
import ModuleModel from "../database/models/ModuleModel";
import ClearanceLevelModel from "../database/models/ClearanceLevelModel";
import { JwtPayload } from "../middlewares/Authentication";
import GrantGuard from "./GrantGuard";
import { isStrictlyAbove } from "../utils/AccessPolicy";

/** UUID em qualquer versão (validação de filtros de query). */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Campos que o usuário pode alterar no próprio cadastro (autoatendimento). */
const SELF_EDITABLE_FIELDS = ['userName', 'email', 'password', 'confirmPassword', 'updatedAt', 'updatedBy'];

/** Nome do nível de acesso do usuário de sistema (bootstrap). */
const SYSTEM_CLEARANCE = "SYSTEM_ADMIN";

class UserService {
  private model: ModelStatic<UserModel> = UserModel;

  /**
   * Cria usuário. O nível concedido (`fkClearanceId`) precisa ser estritamente menor que o do ator.
   * @param data Dados do usuário.
   * @param actor Usuário autenticado (do token), que cria.
   */
  async createUser(data: UserInterface, actor: JwtPayload) {
    // 1. Validação ANTES de abrir transação (Economiza recursos)
    data.createdAt = new Date();
    const { error } = UserValidation.validate(data);
    if (error) return Response.badRequest(error.message);

    const denied = await GrantGuard.canGrantClearance(actor, data.fkClearanceId);
    if (denied) return denied;

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

    } catch (error: unknown) {
      await transaction.rollback(); // Se algo falhou, desfaz TUDO
      logError("createUser", error);
      return Response.internalError("Erro inesperado ao criar usuário.");
    }
  }

  /**
   * Atualiza usuário.
   * - Autoatendimento (`userId` do ator): só nome, e-mail e senha.
   * - Outro usuário: o alvo precisa ter nível estritamente menor que o do ator, e um novo
   *   `fkClearanceId` também.
   * @param userId Usuário a atualizar.
   * @param data Campos a alterar.
   * @param actor Usuário autenticado (do token).
   */
  async updateUser(userId: string, data: Partial<UserInterface>, actor: JwtPayload) {
    if (!userId) return Response.badRequest("ID do usuário não informado");

    data.updatedAt = new Date();

    const { error } = UpdateValidationSchema.UpdateUserValidation.validate(data);
    if (error) return Response.badRequest(error.message);

    if (userId === actor.userId) {
      const forbidden = Object.keys(data).filter(k => !SELF_EDITABLE_FIELDS.includes(k));
      if (forbidden.length) {
        return Response.forbidden(`Autoatendimento não permite alterar: ${forbidden.join(', ')}.`);
      }
    } else {
      const denied = await GrantGuard.canManageUser(actor, userId);
      if (denied) return denied;
      if (data.fkClearanceId) {
        const deniedLevel = await GrantGuard.canGrantClearance(actor, data.fkClearanceId);
        if (deniedLevel) return deniedLevel;
      }
    }

    const transaction = await db.transaction();
    try {
      if (data.password) data.password = await bcrypt.hash(data.password, 10);

      const [updated] = await this.model.update(data, { where: { userId, activated: true }, transaction });

      if (!updated) {
        await transaction.rollback();
        return Response.notFound("Usuário não encontrado para atualização!");
      }

      await transaction.commit();
      const result = await this.model.findByPk(userId, {
        attributes: { exclude: ['password'] }
      });
      return Response.ok("Usuário atualizado com sucesso!", result);

    } catch (error: unknown) {
      await transaction.rollback();
      logError("updateUser", error);
      return Response.internalError("Erro inesperado ao atualizar usuário.");

    }
  }

  /**
   * Desativa o usuário (exclusão lógica): `activated = false`. Nunca remove fisicamente.
   * O token já emitido continua válido até expirar (25 min); o login passa a ser recusado.
   * @param userId Usuário a desativar.
   * @param actor Usuário autenticado que executa a operação (do token).
   * @returns 403 para o usuário de sistema (bootstrap), para a própria conta e para alvo de nível
   * igual ou superior ao do ator; 404 se inexistente ou já inativo.
   */
  async deleteUser(userId: string, actor: JwtPayload) {
    if (!userId) return Response.badRequest("ID do usuário não informado.");
    const updatedBy = actor.userId;

    try {
      const target = await this.model.findOne({
        where: { userId, activated: true },
        include: [{ model: ClearanceLevelModel, as: 'ClearanceLevel' }],
      }) as (UserModel & { ClearanceLevel?: ClearanceLevelModel | null }) | null;

      if (!target) return Response.notFound("Usuário não encontrado para exclusão!");

      if (target.userType === UserTypeEnum.SISTEMA || target.ClearanceLevel?.clearanceName === SYSTEM_CLEARANCE) {
        return Response.forbidden("O usuário de sistema não pode ser desativado.");
      }
      if (target.userId === updatedBy) {
        return Response.forbidden("Não é possível desativar a própria conta.");
      }
      if (!isStrictlyAbove(actor, target.ClearanceLevel?.clearanceName)) {
        return Response.forbidden("Não é permitido desativar usuário de nível igual ou superior ao seu.");
      }

      const [updated] = await this.model.update(
        { activated: false, updatedBy, updatedAt: new Date() },
        { where: { userId, activated: true } }
      );
      if (!updated) return Response.notFound("Usuário não encontrado para exclusão!");

      return Response.ok("Usuário desativado com sucesso");
    } catch (error: unknown) {
      logError("deleteUser", error);
      return Response.internalError("Erro inesperado ao desativar usuário.");
    }
  }

  /**
   * Reativa um usuário desativado (`activated = true`).
   * @param userId Usuário a reativar.
   * @param actor Usuário autenticado que executa a operação (do token). O alvo precisa ter nível
   * estritamente menor que o do ator.
   */
  async reactivateUser(userId: string, actor: JwtPayload) {
    if (!userId) return Response.badRequest("ID do usuário não informado.");
    const updatedBy = actor.userId;

    try {
      const target = await this.model.findOne({
        where: { userId, activated: false },
        include: [{ model: ClearanceLevelModel, as: 'ClearanceLevel' }],
      }) as (UserModel & { ClearanceLevel?: ClearanceLevelModel | null }) | null;
      if (!target) return Response.notFound("Usuário não encontrado ou já ativo!");
      if (!isStrictlyAbove(actor, target.ClearanceLevel?.clearanceName)) {
        return Response.forbidden("Não é permitido reativar usuário de nível igual ou superior ao seu.");
      }

      const [updated] = await this.model.update(
        { activated: true, updatedBy, updatedAt: new Date() },
        { where: { userId, activated: false } }
      );
      if (!updated) return Response.notFound("Usuário não encontrado ou já ativo!");
      return Response.ok("Usuário reativado com sucesso");
    } catch (error: unknown) {
      logError("reactivateUser", error);
      return Response.internalError("Erro inesperado ao reativar usuário.");
    }
  }

  // Métodos de consulta não utilizam transaction por padrão (performance)
  async getUser(userId: string) {
    if (!userId) return Response.badRequest("ID do usuário não informado.");

    try {
      const result = await this.model.findOne({
        where: { userId, activated: true },
        include: [
          { model: EmployeeUserModel, as: 'EmployeeUser' },
          { model: ExternalUserModel, as: 'ExternalUser' },
          {
            model: UserAppRoleModel,
            as: 'UserAppRole',
            where: { activated: true },
            required: false,
            include: [
              { model: AppRoleModel, as: 'AppRole', where: { activated: true }, required: false },
              { model: ModuleModel, as: 'Module', where: { activated: true }, required: false },
            ]
          },

        ],
      });

      if (!result) return Response.notFound("Usuário não encontrado!");

      const enrichedUser = await enrichUserData(result.toJSON());
      return Response.ok("Usuário encontrado com sucesso!", enrichedUser);
    } catch (error: unknown) {
      logError("getUser", error);
      return Response.internalError("Erro inesperado ao buscar usuário.");
    }
  }

  /**
   * Lista usuários ativos com filtros opcionais.
   * `fkEmployeeId` retorna só usuários ativos vinculados ao funcionário (`employee_user`);
   * usado pelo `registry` para bloquear a desativação de funcionário com usuário ativo.
   */
  async findUsers(query: { userName?: string; email?: string; userType?: UserTypeEnum; fkEmployeeId?: string }) {
    if (query.fkEmployeeId && !UUID_REGEX.test(query.fkEmployeeId)) {
      return Response.badRequest("fkEmployeeId deve ser um UUID válido.");
    }

    try {
      const where: any = { activated: true };
      if (query.userName) where.userName = { [Op.iLike]: `%${query.userName}%` };
      if (query.email) where.email = { [Op.iLike]: `%${query.email}%` };
      if (query.userType) where.userType = query.userType;

      const users = await this.model.findAll({
        where,
        include: [
          query.fkEmployeeId
            ? { model: EmployeeUserModel, as: 'EmployeeUser', where: { fkEmployeeId: query.fkEmployeeId, activated: true }, required: true }
            : { model: EmployeeUserModel, as: 'EmployeeUser' },
          { model: ExternalUserModel, as: 'ExternalUser' },
          {
            model: UserAppRoleModel,
            as: 'UserAppRole',
            where: { activated: true },
            required: false,
            include: [
              { model: AppRoleModel, as: 'AppRole', where: { activated: true }, required: false },
              { model: ModuleModel, as: 'Module', where: { activated: true }, required: false },
            ]
          },

        ],
      });

      if (!users.length) return Response.notFound("Nenhum usuário encontrado.");

      const enriched = await Promise.all(users.map(u => enrichUserData(u.toJSON())));
      return Response.ok("Usuários encontrados com sucesso", enriched);
    } catch (error: unknown) {
      logError("findUsers", error);
      return Response.internalError("Erro inesperado ao buscar usuários.");
    }
  }
}

export default UserService;