import { Request, Response, NextFunction } from "express";
import { logError } from "../utils/logError";
import Resp from "../utils/Response";
import MenuService from "../services/MenuService";

class MenuController {
  private service = new MenuService();

  async createMenu(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.createMenu({ ...req.body, createdBy: res.locals.user.userId });
      return res.status(result.status).json(result);
    } catch (error) {
      logError("Erro em createMenu", error);
      const resp = Resp.internalError("Erro interno ao criar menu.");
      return res.status(resp.status).json(resp);
    }
  }

  async updateMenu(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.service.updateMenu(id, { ...req.body, updatedBy: res.locals.user.userId });
      return res.status(result.status).json(result);
    } catch (error) {
      logError("Erro em updateMenu", error);
      const resp = Resp.internalError("Erro interno ao atualizar menu.");
      return res.status(resp.status).json(resp);
    }
  }

  async deleteMenu(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.service.deleteMenu(id, res.locals.user.userId);
      return res.status(result.status).json(result);
    } catch (error) {
      logError("Erro em deleteMenu", error);
      const resp = Resp.internalError("Erro interno ao deletar menu.");
      return res.status(resp.status).json(resp);
    }
  }

  /** PATCH /:id/reactivate — reativa o registro (`activated = true`). */
  async reactivateMenu(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.service.reactivateMenu(id, res.locals.user.userId);
      return res.status(result.status).json(result);
    } catch (error) {
      logError("Erro em reactivateMenu", error);
      const resp = Resp.internalError("Erro interno ao reativar registro.");
      return res.status(resp.status).json(resp);
    }
  }

  async getMenu(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.service.getMenu(id);
      return res.status(result.status).json(result);
    } catch (error) {
      logError("Erro em getMenu", error);
      const resp = Resp.internalError("Erro interno ao buscar menu.");
      return res.status(resp.status).json(resp);
    }
  }

  async findMenus(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.findMenus(req.query);
      return res.status(result.status).json(result);
    } catch (error) {
      logError("Erro em findMenus", error);
      const resp = Resp.internalError("Erro interno ao buscar menus.");
      return res.status(resp.status).json(resp);
    }
  }
}

export default MenuController;
