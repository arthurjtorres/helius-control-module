import { Request, Response, NextFunction } from "express";
import MenuService from "../services/MenuService";

class MenuController {
  private service = new MenuService();

  async createMenu(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.createMenu(req.body);
      return res.status(result.status).json(result);
    } catch (error) {
      console.error("Erro em createMenu:", error);
      return res.status(500).json("Erro interno ao criar menu.");
    }
  }

  async updateMenu(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.service.updateMenu(id, req.body);
      return res.status(result.status).json(result);
    } catch (error) {
      console.error("Erro em updateMenu:", error);
      return res.status(500).json("Erro interno ao atualizar menu.");
    }
  }

  async deleteMenu(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.service.deleteMenu(id);
      return res.status(result.status).json(result);
    } catch (error) {
      console.error("Erro em deleteMenu:", error);
      return res.status(500).json("Erro interno ao deletar menu.");
    }
  }

  async getMenu(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.service.getMenu(id);
      return res.status(result.status).json(result);
    } catch (error) {
      console.error("Erro em getMenu:", error);
      return res.status(500).json("Erro interno ao buscar menu.");
    }
  }

  async findMenus(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.findMenus(req.query);
      return res.status(result.status).json(result);
    } catch (error) {
      console.error("Erro em findMenus:", error);
      return res.status(500).json("Erro interno ao buscar menus.");
    }
  }
}

export default MenuController;
