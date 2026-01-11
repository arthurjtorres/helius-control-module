import { Router } from "express";
import ModuleController from "../controllers/ModuleController";
import { verifyToken } from "./middlewares/Authentication";

const moduleRouter = Router();
const controller = new ModuleController();

// POST - Criação de módulo
moduleRouter.post("/", verifyToken, controller.createModule.bind(controller));

// PUT - Atualização de módulo (ID na URL, dados no body)
moduleRouter.put("/:id", verifyToken, controller.updateModule.bind(controller));

// DELETE - Exclusão de módulo por ID (via URL param)
moduleRouter.delete("/:id", verifyToken, controller.deleteModule.bind(controller));

// GET - Buscar módulo por ID (via URL param)
moduleRouter.get("/:id", controller.getModule.bind(controller));

// GET - Buscar módulos com filtros (via query params)
moduleRouter.get("/", controller.findModules.bind(controller));

export default moduleRouter;
