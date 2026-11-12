import { Request, Response, NextFunction } from "express";
import { logError } from "../utils/logError";
import Resp from "../utils/Response";
import PermitService from "../services/PermitService";

class PermitController {
  private service = new PermitService();

  async createPermit(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.createPermit(req.body);
      return res.status(result.status).json(result);
    } catch (error) {
      logError("Erro em createPermit", error);
      const resp = Resp.internalError("Erro interno ao criar permissão.");
      return res.status(resp.status).json(resp);
    }
  }

  async updatePermit(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.service.updatePermit(id, req.body);
      return res.status(result.status).json(result);
    } catch (error) {
      logError("Erro em updatePermit", error);
      const resp = Resp.internalError("Erro interno ao atualizar permissão.");
      return res.status(resp.status).json(resp);
    }
  }

  async deletePermit(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.service.deletePermit(id, res.locals.user.userId);
      return res.status(result.status).json(result);
    } catch (error) {
      logError("Erro em deletePermit", error);
      const resp = Resp.internalError("Erro interno ao deletar permissão.");
      return res.status(resp.status).json(resp);
    }
  }

  /** PATCH /:id/reactivate — reativa o registro (`activated = true`). */
  async reactivatePermit(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.service.reactivatePermit(id, res.locals.user.userId);
      return res.status(result.status).json(result);
    } catch (error) {
      logError("Erro em reactivatePermit", error);
      const resp = Resp.internalError("Erro interno ao reativar registro.");
      return res.status(resp.status).json(resp);
    }
  }

  async getPermit(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.service.getPermit(id);
      return res.status(result.status).json(result);
    } catch (error) {
      logError("Erro em getPermit", error);
      const resp = Resp.internalError("Erro interno ao buscar permissão.");
      return res.status(resp.status).json(resp);
    }
  }

  async findPermits(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.findPermits(req.query);
      return res.status(result.status).json(result);
    } catch (error) {
      logError("Erro em findPermits", error);
      const resp = Resp.internalError("Erro interno ao buscar permissões.");
      return res.status(resp.status).json(resp);
    }
  }
}

export default PermitController;
