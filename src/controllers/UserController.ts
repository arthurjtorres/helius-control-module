import { Request, Response, NextFunction } from "express";
import UserService from "../services/UserService";

class UserController {
 private service = new UserService();

  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.createUser(req.body);
      return res.status(result.status).json(result);
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      return res.status(500).json("Erro interno ao criar usuário");
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.service.updateUser(id, req.body);
      return res.status(result.status).json(result);
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      return res.status(500).json("Erro interno ao atualizar usuário");
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.service.deleteUser(id);
      return res.status(result.status).json(result);
    } catch (error) {
      console.error("Erro ao deletar usuário:", error);
      return res.status(500).json("Erro interno ao deletar usuário");
    }
  }

  async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.service.getUser(id);
      return res.status(result.status).json(result);
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      return res.status(500).json("Erro interno ao buscar usuário");
    }
  }

  async findUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.findUsers(req.query);
      return res.status(result.status).json(result);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      return res.status(500).json("Erro interno ao buscar usuários");
    }
  }
}

export default UserController;
