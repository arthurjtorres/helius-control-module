import { NextFunction, Request, Response } from "express"
import Resp from "../utils/Response";

export const checkPermission = (requiredMenu: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.user;

    // 1. Regra do Desenvolvedor: SUPER_ADMIN ou DESENVOLVEDOR passa direto
    if (user.userType === 'SISTEMA' || 
      user.clearance === 'SUPER_ADMIN' || 
      user.clearance === 'SYSTEM_ADMIN' || 
      user.appRole === 'DESENVOLVEDOR') {
      return next();
    }

    // 2. Regra de Módulo: Verifica se o usuário pertence ao módulo JURIDICO
    if (user.module !== 'JURIDICO') {
      return Resp.forbidden("Este usuário não pertence ao módulo Jurídico.");
    }

    // 3. Regra de Menu: Verifica se o menu solicitado está na lista de permissões dele
    if (!user.allowedMenus || !user.allowedMenus.includes(requiredMenu)) {
      return Resp.forbidden(`Este usuário não possui acesso ao menu: ${requiredMenu}`);
    }

    next();
  };
};