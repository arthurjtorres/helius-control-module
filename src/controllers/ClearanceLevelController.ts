import { Request, Response, NextFunction } from "express";
import ClearanceLevelService from "../services/ClearanceLevelService";

class ClearanceLevelController {
  private service = new ClearanceLevelService();

  async createClearanceLevel(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.createClearanceLevel(req.body);
      return res.status(result.status).json(result);
    } catch (error) {
      console.error("Erro em createClearanceLevel:", error);
      return res.status(500).json("Erro interno ao criar nível de acesso.");
    }
  }

  async updateClearanceLevel(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.service.updateClearanceLevel(id, req.body);
      return res.status(result.status).json(result);
    } catch (error) {
      console.error("Erro em updateClearanceLevel:", error);
      return res.status(500).json("Erro interno ao atualizar nível de acesso.");
    }
  }

  async deleteClearanceLevel(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.service.deleteClearanceLevel(id);
      return res.status(result.status).json(result);
    } catch (error) {
      console.error("Erro em deleteClearanceLevel:", error);
      return res.status(500).json("Erro interno ao deletar nível de acesso.");
    }
  }

  async getClearanceLevel(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.service.getClearanceLevel(id);
      return res.status(result.status).json(result);
    } catch (error) {
      console.error("Erro em getClearanceLevel:", error);
      return res.status(500).json("Erro interno ao buscar nível de acesso.");
    }
  }

  async findClearanceLevels(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.findClearanceLevels(req.query);
      return res.status(result.status).json(result);
    } catch (error) {
      console.error("Erro em findClearanceLevels:", error);
      return res.status(500).json("Erro interno ao buscar níveis de acesso.");
    }
  }
}

export default ClearanceLevelController;
