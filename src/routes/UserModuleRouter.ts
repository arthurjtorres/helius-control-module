import { Router } from "express";
import UserModuleController from "../controllers/UserModuleController";
import { verifyToken } from "../middlewares/Authentication";

const userModuleRouter = Router();
const controller = new UserModuleController();

// POST - Criar vínculo usuário-módulo
userModuleRouter.post("/", verifyToken, controller.createUserModule.bind(controller));

// PUT - Atualizar vínculo por ID
userModuleRouter.put("/:id", verifyToken, controller.updateUserModule.bind(controller));

// DELETE - Deletar vínculo por ID
userModuleRouter.delete("/:id", verifyToken, controller.deleteUserModule.bind(controller));

// GET - Buscar vínculo por ID
userModuleRouter.get("/:id", controller.getUserModule.bind(controller));

// GET - Buscar vínculos com filtros (query params)
userModuleRouter.get("/", controller.findUserModules.bind(controller));

export default userModuleRouter;
