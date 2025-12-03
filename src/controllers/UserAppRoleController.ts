import { Request, Response, NextFunction } from "express";
import UserAppRoleService from "../services/UserAppRoleService";

class UserAppRoleController {
  private service = new UserAppRoleService();

  async createUserAppRole(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.createUserAppRole(req.body);
      return res.status(result.status).json(result);
    } catch (error) {
      console.error("Erro em createUserAppRole:", error);
      return res.status(500).json("Erro interno ao criar vínculo de papel.");
    }
  }

  async updateUserAppRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.service.updateUserAppRole(id, req.body);
      return res.status(result.status).json(result);
    } catch (error) {
      console.error("Erro em updateUserAppRole:", error);
      return res.status(500).json("Erro interno ao atualizar vínculo de papel.");
    }
  }

  async deleteUserAppRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.service.deleteUserAppRole(id);
      return res.status(result.status).json(result);
    } catch (error) {
      console.error("Erro em deleteUserAppRole:", error);
      return res.status(500).json("Erro interno ao deletar vínculo de papel.");
    }
  }

  async getUserAppRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.service.getUserAppRole(id);
      return res.status(result.status).json(result);
    } catch (error) {
      console.error("Erro em getUserAppRole:", error);
      return res.status(500).json("Erro interno ao buscar vínculo de papel.");
    }
  }

  async findUserAppRoles(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.findUserAppRoles(req.query);
      return res.status(result.status).json(result);
    } catch (error) {
      console.error("Erro em findUserAppRoles:", error);
      return res.status(500).json("Erro interno ao buscar vínculos de papel.");
    }
  }
}

export default UserAppRoleController;
