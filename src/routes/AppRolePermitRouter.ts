import { Router } from "express";
import AppRolePermitController from "../controllers/AppRolePermitController";
import { verifyToken } from "../middlewares/Authentication";

const appRolePermitRouter = Router();
const controller = new AppRolePermitController();

// POST - Criar associação de papel e permissão
appRolePermitRouter.post("/", controller.createAppRolePermit.bind(controller));

// PUT - Atualizar associação por ID
appRolePermitRouter.put("/:id", controller.updateAppRolePermit.bind(controller));

// DELETE - Remover associação por ID
appRolePermitRouter.delete("/:id", controller.deleteAppRolePermit.bind(controller));

// GET - Buscar associação por ID
appRolePermitRouter.get("/:id", controller.getAppRolePermit.bind(controller));

// GET - Buscar associações com filtros (query params)
appRolePermitRouter.get("/", controller.findAppRolePermits.bind(controller));

export default appRolePermitRouter;
