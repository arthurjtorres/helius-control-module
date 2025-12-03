import { Request, Response, NextFunction } from "express";
import AppRolePermitService from "../services/AppRolePermitService";

class AppRolePermitController {
  private service = new AppRolePermitService();

  async createAppRolePermit(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.createAppRolePermit(req.body);
      return res.status(result.status).json(result);
    } catch (error) {
      console.error("Erro em createAppRolePermit:", error);
      return res.status(500).json("Erro interno ao atribuir permissão ao papel.");
    }
  }

  async updateAppRolePermit(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.service.updateAppRolePermit(id, req.body);
      return res.status(result.status).json(result);
    } catch (error) {
      console.error("Erro em updateAppRolePermit:", error);
      return res.status(500).json("Erro interno ao atualizar associação.");
    }
  }

  async deleteAppRolePermit(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.service.deleteAppRolePermit(id);
      return res.status(result.status).json(result);
    } catch (error) {
      console.error("Erro em deleteAppRolePermit:", error);
      return res.status(500).json("Erro interno ao remover associação.");
    }
  }

  async getAppRolePermit(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.service.getAppRolePermit(id);
      return res.status(result.status).json(result);
    } catch (error) {
      console.error("Erro em getAppRolePermit:", error);
      return res.status(500).json("Erro interno ao buscar associação.");
    }
  }

  async findAppRolePermits(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.findAppRolePermits(req.query);
      return res.status(result.status).json(result);
    } catch (error) {
      console.error("Erro em findAppRolePermits:", error);
      return res.status(500).json("Erro interno ao buscar permissões vinculadas.");
    }
  }
}

export default AppRolePermitController;
