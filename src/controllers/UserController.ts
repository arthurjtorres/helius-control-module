import { Request, Response, NextFunction } from "express";
import { logError } from "../utils/logError";
import Resp from "../utils/Response";
import UserService from "../services/UserService";
import { JwtPayload } from "../middlewares/Authentication";

class UserController {
 private service = new UserService();

  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.createUser({ ...req.body, createdBy: (res.locals.user as JwtPayload).userId }, res.locals.user);
      return res.status(result.status).json(result);
    } catch (error) {
      logError("Erro ao criar usuário", error);
      const resp = Resp.internalError("Erro interno ao criar usuário");
      return res.status(resp.status).json(resp);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.service.updateUser(id, { ...req.body, updatedBy: (res.locals.user as JwtPayload).userId }, res.locals.user);
      return res.status(result.status).json(result);
    } catch (error) {
      logError("Erro ao atualizar usuário", error);
      const resp = Resp.internalError("Erro interno ao atualizar usuário");
      return res.status(resp.status).json(resp);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.service.deleteUser(id, res.locals.user);
      return res.status(result.status).json(result);
    } catch (error) {
      logError("Erro ao deletar usuário", error);
      const resp = Resp.internalError("Erro interno ao deletar usuário");
      return res.status(resp.status).json(resp);
    }
  }

  /** PATCH /:id/reactivate — reativa o registro (`activated = true`). */
  async reactivateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.service.reactivateUser(id, res.locals.user);
      return res.status(result.status).json(result);
    } catch (error) {
      logError("Erro em reactivateUser", error);
      const resp = Resp.internalError("Erro interno ao reativar registro.");
      return res.status(resp.status).json(resp);
    }
  }

  async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.service.getUser(id);
      return res.status(result.status).json(result);
    } catch (error) {
      logError("Erro ao buscar usuário", error);
      const resp = Resp.internalError("Erro interno ao buscar usuário");
      return res.status(resp.status).json(resp);
    }
  }

  async findUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.findUsers(req.query);
      return res.status(result.status).json(result);
    } catch (error) {
      logError("Erro ao buscar usuários", error);
      const resp = Resp.internalError("Erro interno ao buscar usuários");
      return res.status(resp.status).json(resp);
    }
  }
}

export default UserController;
