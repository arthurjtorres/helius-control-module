import { Request, Response, NextFunction } from "express";
import PermitService from "../services/PermitService";

class PermitController {
  private service = new PermitService();

  async createPermit(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.createPermit(req.body);
      return res.status(result.status).json(result);
    } catch (error) {
      console.error("Erro em createPermit:", error);
      return res.status(500).json("Erro interno ao criar permissão.");
    }
  }

  async updatePermit(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.service.updatePermit(id, req.body);
      return res.status(result.status).json(result);
    } catch (error) {
      console.error("Erro em updatePermit:", error);
      return res.status(500).json("Erro interno ao atualizar permissão.");
    }
  }

  async deletePermit(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.service.deletePermit(id);
      return res.status(result.status).json(result);
    } catch (error) {
      console.error("Erro em deletePermit:", error);
      return res.status(500).json("Erro interno ao deletar permissão.");
    }
  }

  async getPermit(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.service.getPermit(id);
      return res.status(result.status).json(result);
    } catch (error) {
      console.error("Erro em getPermit:", error);
      return res.status(500).json("Erro interno ao buscar permissão.");
    }
  }

  async findPermits(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.findPermits(req.query);
      return res.status(result.status).json(result);
    } catch (error) {
      console.error("Erro em findPermits:", error);
      return res.status(500).json("Erro interno ao buscar permissões.");
    }
  }
}

export default PermitController;
