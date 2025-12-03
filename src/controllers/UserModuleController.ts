import { Request, Response, NextFunction } from "express";
import UserModuleService from "../services/UserModuleService";

class UserModuleController {
  private service = new UserModuleService();

  async createUserModule(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.createUserModule(req.body);
      return res.status(result.status).json(result);
    } catch (error) {
      console.error("Erro em createUserModule:", error);
      return res.status(500).json("Erro interno ao criar vínculo.");
    }
  }

  async updateUserModule(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.service.updateUserModule(id, req.body);
      return res.status(result.status).json(result);
    } catch (error) {
      console.error("Erro em updateUserModule:", error);
      return res.status(500).json("Erro interno ao atualizar vínculo.");
    }
  }

  async deleteUserModule(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.service.deleteUserModule(id);
      return res.status(result.status).json(result);
    } catch (error) {
      console.error("Erro em deleteUserModule:", error);
      return res.status(500).json("Erro interno ao deletar vínculo.");
    }
  }

  async getUserModule(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.service.getUserModule(id);
      return res.status(result.status).json(result);
    } catch (error) {
      console.error("Erro em getUserModule:", error);
      return res.status(500).json("Erro interno ao buscar vínculo.");
    }
  }

  async findUserModules(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.findUserModules(req.query);
      return res.status(result.status).json(result);
    } catch (error) {
      console.error("Erro em findUserModules:", error);
      return res.status(500).json("Erro interno ao buscar vínculos.");
    }
  }
}

export default UserModuleController;
