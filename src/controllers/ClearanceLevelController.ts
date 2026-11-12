import { Request, Response, NextFunction } from "express";
import { logError } from "../utils/logError";
import Resp from "../utils/Response";
import ClearanceLevelService from "../services/ClearanceLevelService";

class ClearanceLevelController {
  private service = new ClearanceLevelService();

  async createClearanceLevel(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.createClearanceLevel(req.body);
      return res.status(result.status).json(result);
    } catch (error) {
      logError("Erro em createClearanceLevel", error);
      const resp = Resp.internalError("Erro interno ao criar nível de acesso.");
      return res.status(resp.status).json(resp);
    }
  }

  async updateClearanceLevel(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.service.updateClearanceLevel(id, req.body);
      return res.status(result.status).json(result);
    } catch (error) {
      logError("Erro em updateClearanceLevel", error);
      const resp = Resp.internalError("Erro interno ao atualizar nível de acesso.");
      return res.status(resp.status).json(resp);
    }
  }

  async deleteClearanceLevel(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.service.deleteClearanceLevel(id, res.locals.user.userId);
      return res.status(result.status).json(result);
    } catch (error) {
      logError("Erro em deleteClearanceLevel", error);
      const resp = Resp.internalError("Erro interno ao deletar nível de acesso.");
      return res.status(resp.status).json(resp);
    }
  }

  /** PATCH /:id/reactivate — reativa o registro (`activated = true`). */
  async reactivateClearanceLevel(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.service.reactivateClearanceLevel(id, res.locals.user.userId);
      return res.status(result.status).json(result);
    } catch (error) {
      logError("Erro em reactivateClearanceLevel", error);
      const resp = Resp.internalError("Erro interno ao reativar registro.");
      return res.status(resp.status).json(resp);
    }
  }

  async getClearanceLevel(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.service.getClearanceLevel(id);
      return res.status(result.status).json(result);
    } catch (error) {
      logError("Erro em getClearanceLevel", error);
      const resp = Resp.internalError("Erro interno ao buscar nível de acesso.");
      return res.status(resp.status).json(resp);
    }
  }

  async findClearanceLevels(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.findClearanceLevels(req.query);
      return res.status(result.status).json(result);
    } catch (error) {
      logError("Erro em findClearanceLevels", error);
      const resp = Resp.internalError("Erro interno ao buscar níveis de acesso.");
      return res.status(resp.status).json(resp);
    }
  }
}

export default ClearanceLevelController;
