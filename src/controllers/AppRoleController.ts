import { Request, Response, NextFunction } from "express";
import AppRoleService from "../services/AppRoleService";

class AppRoleController {
  private service = new AppRoleService();

  async createAppRole(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.createAppRole(req.body);
      return res.status(result.status).json(result);
    } catch (error) {
      console.error("Erro em createAppRole:", error);
      return res.status(500).json("Erro interno ao criar a função.");
    }
  }

  async updateAppRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.service.updateAppRole(id, req.body);
      return res.status(result.status).json(result);
    } catch (error) {
      console.error("Erro em updateAppRole:", error);
      return res.status(500).json("Erro interno ao atualizar a função.");
    }
  }

  async deleteAppRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.service.deleteAppRole(id);
      return res.status(result.status).json(result);
    } catch (error) {
      console.error("Erro em deleteAppRole:", error);
      return res.status(500).json("Erro interno ao deletar a função.");
    }
  }

  async getAppRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.service.getAppRole(id);
      return res.status(result.status).json(result);
    } catch (error) {
      console.error("Erro em getAppRole:", error);
      return res.status(500).json("Erro interno ao buscar a função.");
    }
  }

  async findAppRoles(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.findAppRoles(req.query);
      return res.status(result.status).json(result);
    } catch (error) {
      console.error("Erro em findAppRoles:", error);
      return res.status(500).json("Erro interno ao buscar funções.");
    }
  }
}

export default AppRoleController;
