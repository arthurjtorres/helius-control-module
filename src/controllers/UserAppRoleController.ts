import { Request, Response, NextFunction } from "express";
import { logError } from "../utils/logError";
import Resp from "../utils/Response";
import UserAppRoleService from "../services/UserAppRoleService";

class UserAppRoleController {
  private service = new UserAppRoleService();

  async createUserAppRole(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.createUserAppRole({ ...req.body, createdBy: res.locals.user.userId }, res.locals.user);
      return res.status(result.status).json(result);
    } catch (error) {
      logError("Erro em createUserAppRole", error);
      const resp = Resp.internalError("Erro interno ao criar vínculo de papel.");
      return res.status(resp.status).json(resp);
    }
  }

  async updateUserAppRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.service.updateUserAppRole(id, { ...req.body, updatedBy: res.locals.user.userId }, res.locals.user);
      return res.status(result.status).json(result);
    } catch (error) {
      logError("Erro em updateUserAppRole", error);
      const resp = Resp.internalError("Erro interno ao atualizar vínculo de papel.");
      return res.status(resp.status).json(resp);
    }
  }

  async deleteUserAppRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.service.deleteUserAppRole(id, res.locals.user);
      return res.status(result.status).json(result);
    } catch (error) {
      logError("Erro em deleteUserAppRole", error);
      const resp = Resp.internalError("Erro interno ao deletar vínculo de papel.");
      return res.status(resp.status).json(resp);
    }
  }

  async getUserAppRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.service.getUserAppRole(id);
      return res.status(result.status).json(result);
    } catch (error) {
      logError("Erro em getUserAppRole", error);
      const resp = Resp.internalError("Erro interno ao buscar vínculo de papel.");
      return res.status(resp.status).json(resp);
    }
  }

  async findUserAppRoles(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.findUserAppRoles(req.query);
      return res.status(result.status).json(result);
    } catch (error) {
      logError("Erro em findUserAppRoles", error);
      const resp = Resp.internalError("Erro interno ao buscar vínculos de papel.");
      return res.status(resp.status).json(resp);
    }
  }
}

export default UserAppRoleController;
