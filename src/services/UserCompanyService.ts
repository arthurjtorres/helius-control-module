import joi from "joi";
import UserCompanyModel from "../database/models/UserCompanyModel";
import UserModel from "../database/models/UserModel";
import EmployeeUserModel from "../database/models/EmployeeUserModel";
import Response from "../utils/Response";
import { JwtPayload } from "../middlewares/Authentication";
import GrantGuard, { GrantDenial } from "./GrantGuard";
import { getEmployeeById } from "./integrations/EmployeeService";
import { EmployeeCompany, getGroupCompanyIds, RegistryUnavailableError } from "./integrations/CompanyService";
import { UserTypeEnum } from "../database/models/enums/UserTypeEnum";
import { ClearanceEnum, clearanceRank } from "../database/models/enums/ClearanceEnum";

const linkSchema = joi.object({ fkUserId: joi.string().uuid().required(), fkCompanyId: joi.string().uuid().required() });
const UNAVAILABLE = { status: 503, message: "Módulo de cadastro indisponível; tente novamente." };

/**
 * Empresas concedidas ao usuário (T18, ADR-021). Só `SISTEMA`, `SYSTEM_ADMIN` ou `SUPER_ADMIN` concedem,
 * a usuário de nível abaixo do seu e empresa que eles mesmos veem; a empresa precisa ser do grupo
 * da empresa do funcionário que recebe o acesso.
 */
class UserCompanyService {
  /** Clearance de quem concede, empresa visível para ele e alvo de nível abaixo do seu. */
  private async guard(actor: JwtPayload, link: { fkUserId: string; fkCompanyId: string }): Promise<GrantDenial> {
    const isSystem = actor.userType === UserTypeEnum.SISTEMA;
    if (!isSystem && clearanceRank(actor.clearance) < clearanceRank(ClearanceEnum.SUPER_ADMIN)) {
      return Response.forbidden("Só SUPER_ADMIN ou SYSTEM_ADMIN concedem empresas.");
    }
    if (!isSystem && !(actor.companyIds ?? []).includes(link.fkCompanyId)) {
      return Response.forbidden("Empresa fora do seu escopo.");
    }
    return GrantGuard.canManageUser(actor, link.fkUserId);
  }

  /** Empresa do funcionário ativo vinculado ao usuário COLABORADOR (`null` se não houver). */
  private async employeeCompany(userId: string): Promise<EmployeeCompany | null> {
    const user = await UserModel.findOne({
      where: { userId, activated: true, userType: UserTypeEnum.COLABORADOR },
      include: [{ model: EmployeeUserModel, as: 'EmployeeUser' }],
    }) as (UserModel & { EmployeeUser?: EmployeeUserModel | null }) | null;
    const employeeId = user?.EmployeeUser?.fkEmployeeId;
    const employee = employeeId ? await getEmployeeById(employeeId) : null;
    return employee?.Company?.companyId ? employee.Company : null;
  }

  async create(data: { fkUserId?: unknown; fkCompanyId?: unknown }, actor: JwtPayload) {
    const { error, value } = linkSchema.validate({ fkUserId: data.fkUserId, fkCompanyId: data.fkCompanyId });
    if (error) return Response.badRequest(error.message);

    const denied = await this.guard(actor, value);
    if (denied) return denied;

    const company = await this.employeeCompany(value.fkUserId);
    if (!company) return Response.badRequest("O usuário não tem funcionário ativo com empresa.");
    if (company.companyId === value.fkCompanyId) return Response.badRequest("Essa já é a empresa do funcionário.");
    try {
      if (!(await getGroupCompanyIds(company)).includes(value.fkCompanyId)) {
        return Response.badRequest("A empresa não é do grupo da empresa do funcionário.");
      }
    } catch (e) {
      if (e instanceof RegistryUnavailableError) return UNAVAILABLE;
      throw e;
    }

    if (await UserCompanyModel.findOne({ where: value })) return Response.conflict("Empresa já concedida ao usuário.");
    await UserCompanyModel.create({ ...value, createdBy: actor.userId, createdAt: new Date() });
    return Response.created("Empresa concedida ao usuário.");
  }

  async remove(fkUserId: string, fkCompanyId: string, actor: JwtPayload) {
    const { error, value } = linkSchema.validate({ fkUserId, fkCompanyId });
    if (error) return Response.badRequest(error.message);

    const denied = await this.guard(actor, value);
    if (denied) return denied;

    const deleted = await UserCompanyModel.destroy({ where: value });
    if (!deleted) return Response.notFound("Vínculo não encontrado!");
    return Response.ok("Empresa retirada do usuário.");
  }

  /** Empresas concedidas a um usuário (lista vazia é 200). */
  async findByUser(fkUserId: unknown) {
    const { error } = joi.string().uuid().required().validate(fkUserId);
    if (error) return Response.badRequest("fkUserId inválido.");
    const result = await UserCompanyModel.findAll({ where: { fkUserId: fkUserId as string } });
    return Response.ok("Empresas do usuário.", result);
  }
}

export default UserCompanyService;
