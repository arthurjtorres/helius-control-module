import { Request, Response, NextFunction } from "express";
import { logError } from "../utils/logError";
import Resp from "../utils/Response";
import UserCompanyService from "../services/UserCompanyService";

class UserCompanyController {
  private service = new UserCompanyService();

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.create(req.body ?? {}, res.locals.user);
      return res.status(result.status).json(result);
    } catch (error) {
      logError("Erro em createUserCompany", error);
      const resp = Resp.internalError("Erro interno ao conceder empresa.");
      return res.status(resp.status).json(resp);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.remove(req.params.userId, req.params.companyId, res.locals.user);
      return res.status(result.status).json(result);
    } catch (error) {
      logError("Erro em deleteUserCompany", error);
      const resp = Resp.internalError("Erro interno ao retirar empresa.");
      return res.status(resp.status).json(resp);
    }
  }

  async findByUser(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.findByUser(req.query.fkUserId);
      return res.status(result.status).json(result);
    } catch (error) {
      logError("Erro em findUserCompanies", error);
      const resp = Resp.internalError("Erro interno ao buscar empresas do usuário.");
      return res.status(resp.status).json(resp);
    }
  }
}

export default UserCompanyController;
