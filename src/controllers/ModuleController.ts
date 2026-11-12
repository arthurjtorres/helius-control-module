import { Request, Response, NextFunction } from "express";
import { logError } from "../utils/logError";
import Resp from "../utils/Response";
import ModuleService from "../services/ModuleService";

class ModuleController {
  private service = new ModuleService();

  async createModule(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.createModule({ ...req.body, createdBy: res.locals.user.userId });
      return res.status(result.status).json(result);
    } catch (error) {
      logError("Erro ao criar módulo", error);
      const resp = Resp.internalError("Erro interno ao criar módulo.");
      return res.status(resp.status).json(resp);
    }
  }

  async updateModule(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.service.updateModule(id, { ...req.body, updatedBy: res.locals.user.userId });
      return res.status(result.status).json(result);
    } catch (error) {
      logError("Erro ao atualizar módulo", error);
      const resp = Resp.internalError("Erro interno ao atualizar módulo.");
      return res.status(resp.status).json(resp);
    }
  }

  async deleteModule(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.service.deleteModule(id, res.locals.user.userId);
      return res.status(result.status).json(result);
    } catch (error) {
      logError("Erro ao deletar módulo", error);
      const resp = Resp.internalError("Erro interno ao deletar módulo.");
      return res.status(resp.status).json(resp);
    }
  }

  /** PATCH /:id/reactivate — reativa o registro (`activated = true`). */
  async reactivateModule(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.service.reactivateModule(id, res.locals.user.userId);
      return res.status(result.status).json(result);
    } catch (error) {
      logError("Erro em reactivateModule", error);
      const resp = Resp.internalError("Erro interno ao reativar registro.");
      return res.status(resp.status).json(resp);
    }
  }

  async getModule(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.service.getModule(id);
      return res.status(result.status).json(result);
    } catch (error) {
      logError("Erro ao buscar módulo", error);
      const resp = Resp.internalError("Erro interno ao buscar módulo.");
      return res.status(resp.status).json(resp);
    }
  }

  async findModules(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.findModules(req.query);
      return res.status(result.status).json(result);
    } catch (error) {
      logError("Erro ao buscar módulos", error);
      const resp = Resp.internalError("Erro interno ao buscar módulos.");
      return res.status(resp.status).json(resp);
    }
  }
}

export default ModuleController;
