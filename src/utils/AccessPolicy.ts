import { JwtPayload } from "../middlewares/Authentication";
import {
  clearanceRank,
  DEVELOPER_ROLE,
  FULL_ACCESS_CLEARANCE,
} from "../database/models/enums/ClearanceEnum";

/** Ação que o menu precisa permitir para a operação. */
export type MenuRequirement = { menu: string; permissions: string[] };

/** `true` se o token é de serviço entre módulos (ADR-011). */
export const isServiceToken = (user?: JwtPayload): boolean => user?.tokenType === 'service';

/**
 * Administrador com acesso total: clearance ≥ `SUPER_ADMIN` ou role `DESENVOLVEDOR`.
 * Dispensa permissão por menu, módulo e role. Não dispensa a regra de hierarquia.
 */
export const hasFullAccess = (user?: JwtPayload): boolean => {
  if (!user || isServiceToken(user)) return false;
  if (clearanceRank(user.clearance) >= clearanceRank(FULL_ACCESS_CLEARANCE)) return true;
  return (user.roles ?? []).some(r => r.role === DEVELOPER_ROLE);
};

/** Posição do usuário autenticado na hierarquia (`0` se for token de serviço). */
export const actorRank = (user?: JwtPayload): number =>
  !user || isServiceToken(user) ? 0 : clearanceRank(user.clearance);

/**
 * Regra "ninguém acima do criador": o ator só atua sobre quem, ou concede o que,
 * tem nível **estritamente menor** que o dele.
 * @param actor Usuário autenticado (do token, nunca do body).
 * @param targetClearance Nome do nível do alvo ou do nível concedido.
 */
export const isStrictlyAbove = (actor: JwtPayload | undefined, targetClearance?: string | null): boolean =>
  actorRank(actor) > clearanceRank(targetClearance);

/** O ator tem o módulo (ou é administrador com acesso total)? */
export const actorHasModule = (actor: JwtPayload | undefined, moduleName: string): boolean =>
  hasFullAccess(actor) || (actor?.modules ?? []).includes(moduleName);

/**
 * Lista o que o ator não possui entre os menus/ações exigidos.
 * Vazio = o ator pode conceder essa role. Administrador com acesso total nunca tem faltas.
 * @returns Itens `menu:AÇÃO` ausentes.
 */
export const missingPermissions = (actor: JwtPayload | undefined, required: MenuRequirement[]): string[] => {
  if (hasFullAccess(actor)) return [];
  const owned = new Map((actor?.allowedMenus ?? []).map(m => [m.menu, new Set(m.permissions ?? [])]));
  const missing: string[] = [];
  required.forEach(({ menu, permissions }) =>
    permissions.forEach(p => {
      if (!owned.get(menu)?.has(p)) missing.push(`${menu}:${p}`);
    })
  );
  return missing;
};
