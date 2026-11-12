import { Request, Response, NextFunction } from "express";
import { logError } from "../utils/logError";
import Resp from "../utils/Response";
import AppRoleService from "../services/AppRoleService";

class AppRoleController {
  private service = new AppRoleService();

  async createAppRole(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.createAppRole(req.body);
      return res.status(result.status).json(result);
    } catch (error) {
      logError("Erro em createAppRole", error);
      const resp = Resp.internalError("Erro interno ao criar a função.");
      return res.status(resp.status).json(resp);
    }
  }

  async updateAppRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.service.updateAppRole(id, req.body);
      return res.status(result.status).json(result);
    } catch (error) {
      logError("Erro em updateAppRole", error);
      const resp = Resp.internalError("Erro interno ao atualizar a função.");
      return res.status(resp.status).json(resp);
    }
  }

  async deleteAppRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.service.deleteAppRole(id, res.locals.user.userId);
      return res.status(result.status).json(result);
    } catch (error) {
      logError("Erro em deleteAppRole", error);
      const resp = Resp.internalError("Erro interno ao deletar a função.");
      return res.status(resp.status).json(resp);
    }
  }

  /** PATCH /:id/reactivate — reativa o registro (`activated = true`). */
  async reactivateAppRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.service.reactivateAppRole(id, res.locals.user.userId);
      return res.status(result.status).json(result);
    } catch (error) {
      logError("Erro em reactivateAppRole", error);
      const resp = Resp.internalError("Erro interno ao reativar registro.");
      return res.status(resp.status).json(resp);
    }
  }

  async getAppRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.service.getAppRole(id);
      return res.status(result.status).json(result);
    } catch (error) {
      logError("Erro em getAppRole", error);
      const resp = Resp.internalError("Erro interno ao buscar a função.");
      return res.status(resp.status).json(resp);
    }
  }

  async findAppRoles(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.findAppRoles(req.query);
      return res.status(result.status).json(result);
    } catch (error) {
      logError("Erro em findAppRoles", error);
      const resp = Resp.internalError("Erro interno ao buscar funções.");
      return res.status(resp.status).json(resp);
    }
  }
}

export default AppRoleController;
