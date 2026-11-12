import { Request, Response, NextFunction } from "express";
import { logError } from "../utils/logError";
import Resp from "../utils/Response";
import AppRolePermitService from "../services/AppRolePermitService";

class AppRolePermitController {
  private service = new AppRolePermitService();

  async createAppRolePermit(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.createAppRolePermit({ ...req.body, createdBy: res.locals.user.userId });
      return res.status(result.status).json(result);
    } catch (error) {
      logError("Erro em createAppRolePermit", error);
      const resp = Resp.internalError("Erro interno ao atribuir permissão ao papel.");
      return res.status(resp.status).json(resp);
    }
  }

  async updateAppRolePermit(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.service.updateAppRolePermit(id, { ...req.body, updatedBy: res.locals.user.userId });
      return res.status(result.status).json(result);
    } catch (error) {
      logError("Erro em updateAppRolePermit", error);
      const resp = Resp.internalError("Erro interno ao atualizar associação.");
      return res.status(resp.status).json(resp);
    }
  }

  async deleteAppRolePermit(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.service.deleteAppRolePermit(id);
      return res.status(result.status).json(result);
    } catch (error) {
      logError("Erro em deleteAppRolePermit", error);
      const resp = Resp.internalError("Erro interno ao remover associação.");
      return res.status(resp.status).json(resp);
    }
  }

  async getAppRolePermit(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.service.getAppRolePermit(id);
      return res.status(result.status).json(result);
    } catch (error) {
      logError("Erro em getAppRolePermit", error);
      const resp = Resp.internalError("Erro interno ao buscar associação.");
      return res.status(resp.status).json(resp);
    }
  }

  async findAppRolePermits(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.findAppRolePermits(req.query);
      return res.status(result.status).json(result);
    } catch (error) {
      logError("Erro em findAppRolePermits", error);
      const resp = Resp.internalError("Erro interno ao buscar permissões vinculadas.");
      return res.status(resp.status).json(resp);
    }
  }
}

export default AppRolePermitController;
