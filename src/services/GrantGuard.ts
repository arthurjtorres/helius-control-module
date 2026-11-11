import { JwtPayload } from "../middlewares/Authentication";
import Response from "../utils/Response";
import UserModel from "../database/models/UserModel";
import ClearanceLevelModel from "../database/models/ClearanceLevelModel";
import ModuleModel from "../database/models/ModuleModel";
import AppRolePermitModel from "../database/models/AppRolePermitModel";
import MenuModel from "../database/models/MenuModel";
import PermitModel from "../database/models/PermitModel";
import {
  actorHasModule,
  isStrictlyAbove,
  MenuRequirement,
  missingPermissions,
} from "../utils/AccessPolicy";

/** Negação a devolver pelo service (`null` = permitido). */
export type GrantDenial = { status: number; message: string } | null;

/** Usuário alvo com o nível carregado. */
type UserWithClearance = UserModel & { ClearanceLevel?: ClearanceLevelModel | null };

/**
 * Regras "ninguém acima do criador" (T05). Sempre recebem o ator do token, nunca do body.
 * Regra única: só atua sobre quem, ou concede o que, esteja **estritamente abaixo** do ator;
 * módulos e roles concedidos devem estar contidos no que o próprio ator possui
 * (administrador com acesso total dispensa essa contenção).
 */
class GrantGuard {
  /**
   * O ator pode conceder este nível de acesso?
   * @param actor Usuário autenticado.
   * @param clearanceId UUID de `clearance_level`.
   */
  static async canGrantClearance(actor: JwtPayload, clearanceId: string): Promise<GrantDenial> {
    const clearance = await ClearanceLevelModel.findOne({ where: { clearanceId, activated: true } });
    if (!clearance) return Response.badRequest("Nível de acesso inexistente ou inativo.");
    if (!isStrictlyAbove(actor, clearance.clearanceName)) {
      return Response.forbidden("Não é permitido conceder nível de acesso igual ou superior ao seu.");
    }
    return null;
  }

  /**
   * O ator pode alterar este usuário? Exige nível do alvo estritamente menor.
   * @param actor Usuário autenticado.
   * @param targetUserId Usuário afetado.
   */
  static async canManageUser(actor: JwtPayload, targetUserId: string): Promise<GrantDenial> {
    const target = await UserModel.findOne({
      where: { userId: targetUserId, activated: true },
      include: [{ model: ClearanceLevelModel, as: 'ClearanceLevel' }],
    }) as UserWithClearance | null;
    if (!target) return Response.notFound("Usuário alvo não encontrado ou inativo.");
    if (!isStrictlyAbove(actor, target.ClearanceLevel?.clearanceName)) {
      return Response.forbidden("Não é permitido alterar usuário de nível igual ou superior ao seu.");
    }
    return null;
  }

  /**
   * O ator pode conceder este módulo e esta role ao alvo?
   * Módulo: o ator precisa possuí-lo. Role: cada menu/ação da role precisa estar entre as do ator.
   * @param actor Usuário autenticado.
   * @param grant Módulo e, se houver, role concedidos.
   */
  static async canGrantAccess(
    actor: JwtPayload,
    grant: { fkModuleId: string; fkAppRoleId?: string }
  ): Promise<GrantDenial> {
    const module = await ModuleModel.findOne({ where: { moduleId: grant.fkModuleId, activated: true } });
    if (!module) return Response.badRequest("Módulo inexistente ou inativo.");
    if (!actorHasModule(actor, module.moduleName)) {
      return Response.forbidden(`Não é permitido conceder o módulo ${module.moduleName}: o usuário não o possui.`);
    }

    if (grant.fkAppRoleId) {
      const links = await AppRolePermitModel.findAll({
        where: { fkAppRoleId: grant.fkAppRoleId, activated: true },
        include: [{ model: MenuModel, as: 'Menu' }, { model: PermitModel, as: 'Permit' }],
      }) as (AppRolePermitModel & { Menu?: MenuModel | null; Permit?: PermitModel | null })[];

      const required: MenuRequirement[] = links
        .filter(l => l.Menu?.activated && l.Permit?.activated)
        .map(l => ({ menu: l.Menu!.menuName, permissions: l.Permit!.permitList ?? [] }));

      const missing = missingPermissions(actor, required);
      if (missing.length) {
        return Response.forbidden(`Não é permitido conceder role com permissões que o usuário não possui: ${missing.join(', ')}.`);
      }
    }
    return null;
  }
}

export default GrantGuard;
