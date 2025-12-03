import { Router } from "express";
import AppRoleController from "../controllers/AppRoleController";

const appRoleRouter = Router();
const controller = new AppRoleController();

// POST - Criar função de aplicativo
appRoleRouter.post("/", controller.createAppRole.bind(controller));

// PUT - Atualizar função por ID
appRoleRouter.put("/:id", controller.updateAppRole.bind(controller));

// DELETE - Remover função por ID
appRoleRouter.delete("/:id", controller.deleteAppRole.bind(controller));

// GET - Buscar função por ID
appRoleRouter.get("/:id", controller.getAppRole.bind(controller));

// GET - Buscar funções com filtros
appRoleRouter.get("/", controller.findAppRoles.bind(controller));

export default appRoleRouter;
