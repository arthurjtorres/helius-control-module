import { Request, Response, NextFunction } from "express";
import { logError } from "../utils/logError";
import Resp from "../utils/Response";
import UserModuleService from "../services/UserModuleService";

class UserModuleController {
  private service = new UserModuleService();

  async createUserModule(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.createUserModule({ ...req.body, createdBy: res.locals.user.userId }, res.locals.user);
      return res.status(result.status).json(result);
    } catch (error) {
      logError("Erro em createUserModule", error);
      const resp = Resp.internalError("Erro interno ao criar vínculo.");
      return res.status(resp.status).json(resp);
    }
  }

  async updateUserModule(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.service.updateUserModule(id, { ...req.body, updatedBy: res.locals.user.userId }, res.locals.user);
      return res.status(result.status).json(result);
    } catch (error) {
      logError("Erro em updateUserModule", error);
      const resp = Resp.internalError("Erro interno ao atualizar vínculo.");
      return res.status(resp.status).json(resp);
    }
  }

  async deleteUserModule(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.service.deleteUserModule(id, res.locals.user);
      return res.status(result.status).json(result);
    } catch (error) {
      logError("Erro em deleteUserModule", error);
      const resp = Resp.internalError("Erro interno ao deletar vínculo.");
      return res.status(resp.status).json(resp);
    }
  }

  async getUserModule(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.service.getUserModule(id);
      return res.status(result.status).json(result);
    } catch (error) {
      logError("Erro em getUserModule", error);
      const resp = Resp.internalError("Erro interno ao buscar vínculo.");
      return res.status(resp.status).json(resp);
    }
  }

  async findUserModules(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.findUserModules(req.query);
      return res.status(result.status).json(result);
    } catch (error) {
      logError("Erro em findUserModules", error);
      const resp = Resp.internalError("Erro interno ao buscar vínculos.");
      return res.status(resp.status).json(resp);
    }
  }
}

export default UserModuleController;
