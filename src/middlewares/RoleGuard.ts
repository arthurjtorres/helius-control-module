import { NextFunction, Request, Response } from "express";
import Resp from "../utils/Response";

export const authorize = (allowedTypes: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.user;

    if (!user || !allowedTypes.includes(user.userType)) {
      const resp = Resp.unauthorized("Você não tem permissão para acessar este recurso.");
      return res.status(resp.status).json({ message: resp.message });
    }

    next();
  };
};