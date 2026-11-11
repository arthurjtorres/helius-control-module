import { NextFunction, Request, Response as ExpressResponse } from "express";
import Response from "../utils/Response";
import { JwtPayload } from "./Authentication";
import { PermissionEnum } from "../database/models/enums/PermissionEnum";
import { ClearanceEnum, clearanceRank } from "../database/models/enums/ClearanceEnum";
import { actorRank, hasFullAccess, isServiceToken } from "../utils/AccessPolicy";

/** Nome do módulo em `module.module_name`. */
const CURRENT_MODULE = 'CONTROLE';

/** Métodos que o token de serviço pode usar. */
const SERVICE_SAFE_METHODS = ['GET', 'HEAD'];

/** Responde a negação (401/403) e interrompe a cadeia. */
const deny = (res: ExpressResponse, resp: { status: number; message: string }) =>
  res.status(resp.status).json({ message: resp.message });

/**
 * Avalia se o usuário pode executar a ação no menu. Devolve `null` se pode,
 * ou a resposta de negação.
 * @param user Payload do JWT.
 * @param method Método HTTP (o token de serviço só lê).
 * @param requiredMenu Menu exigido.
 * @param requiredAction Ação exigida (valor de `permit_list`).
 */
export const evaluatePermission = (
  user: JwtPayload | undefined,
  method: string,
  requiredMenu: string,
  requiredAction?: PermissionEnum
): { status: number; message: string } | null => {
  if (!user) return Response.unauthorized("Usuário não identificado no contexto.");

  // 1. Token de serviço: só leitura, sem módulo nem menu (ADR-011).
  if (isServiceToken(user)) {
    return SERVICE_SAFE_METHODS.includes(method)
      ? null
      : Response.forbidden("Token de serviço permite apenas consultas");
  }

  // 2. Administrador (clearance ≥ SUPER_ADMIN) ou role DESENVOLVEDOR: acesso total.
  if (hasFullAccess(user)) return null;

  // 3. Módulo
  if (!(user.modules ?? []).includes(CURRENT_MODULE)) {
    return Response.forbidden(`Este usuário não pertence ao módulo ${CURRENT_MODULE}.`);
  }

  // 4. Menu
  const menuPermission = (user.allowedMenus ?? []).find(m => m.menu === requiredMenu);
  if (!menuPermission) {
    return Response.forbidden(`Este usuário não possui acesso ao menu: ${requiredMenu}`);
  }

  // 5. Ação, lida do array `permit_list`
  if (requiredAction && !(menuPermission.permissions ?? []).includes(requiredAction)) {
    return Response.forbidden(`Ação não permitida: ${requiredAction} em ${requiredMenu}`);
  }

  return null;
};

/**
 * Exige permissão por menu e ação. Deve vir depois de `verifyToken`.
 * @param requiredMenu Menu exigido (`menu.menu_name`).
 * @param requiredAction Ação exigida (`PermissionEnum`).
 */
export const checkPermission = (requiredMenu: string, requiredAction?: PermissionEnum) =>
  (req: Request, res: ExpressResponse, next: NextFunction) => {
    const denied = evaluatePermission(res.locals.user as JwtPayload | undefined, req.method, requiredMenu, requiredAction);
    return denied ? deny(res, denied) : next();
  };

/**
 * Como `checkPermission`, mas dispensa a permissão quando o usuário age sobre o próprio
 * cadastro (`:id` igual ao `userId` do token). Os campos permitidos no autoatendimento
 * são limitados no service.
 * @param idParam Nome do parâmetro de rota com o id do usuário.
 */
export const checkPermissionOrSelf = (
  requiredMenu: string,
  requiredAction: PermissionEnum,
  idParam: string = 'id'
) => (req: Request, res: ExpressResponse, next: NextFunction) => {
  const user = res.locals.user as JwtPayload | undefined;
  if (user && !isServiceToken(user) && user.userId === req.params[idParam]) return next();
  const denied = evaluatePermission(user, req.method, requiredMenu, requiredAction);
  return denied ? deny(res, denied) : next();
};

/**
 * Exige nível mínimo na hierarquia (ex.: escrita em estrutura do sistema).
 * A role `DESENVOLVEDOR` não substitui o nível. Token de serviço nunca passa.
 * @param minimum Nível mínimo exigido.
 */
export const requireMinClearance = (minimum: ClearanceEnum) =>
  (req: Request, res: ExpressResponse, next: NextFunction) => {
    const user = res.locals.user as JwtPayload | undefined;
    if (!user) return deny(res, Response.unauthorized("Usuário não identificado no contexto."));
    if (actorRank(user) < clearanceRank(minimum)) {
      return deny(res, Response.forbidden(`Nível de acesso insuficiente. Necessário: ${minimum} ou superior.`));
    }
    return next();
  };
