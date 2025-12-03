import { Request, Response, NextFunction } from "express";
import ModuleService from "../services/ModuleService";

class ModuleController {
  private service = new ModuleService();

  async createModule(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.createModule(req.body);
      return res.status(result.status).json(result);
    } catch (error) {
      console.error("Erro ao criar módulo:", error);
      return res.status(500).json("Erro interno ao criar módulo.");
    }
  }

  async updateModule(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.service.updateModule(id, req.body);
      return res.status(result.status).json(result);
    } catch (error) {
      console.error("Erro ao atualizar módulo:", error);
      return res.status(500).json("Erro interno ao atualizar módulo.");
    }
  }

  async deleteModule(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.service.deleteModule(id);
      return res.status(result.status).json(result);
    } catch (error) {
      console.error("Erro ao deletar módulo:", error);
      return res.status(500).json("Erro interno ao deletar módulo.");
    }
  }

  async getModule(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.service.getModule(id);
      return res.status(result.status).json(result);
    } catch (error) {
      console.error("Erro ao buscar módulo:", error);
      return res.status(500).json("Erro interno ao buscar módulo.");
    }
  }

  async findModules(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.findModules(req.query);
      return res.status(result.status).json(result);
    } catch (error) {
      console.error("Erro ao buscar módulos:", error);
      return res.status(500).json("Erro interno ao buscar módulos.");
    }
  }
}

export default ModuleController;
