import { Router } from "express";
import UserAppRoleController from "../controllers/UserAppRoleController";

const userAppRoleRouter = Router();
const controller = new UserAppRoleController();

// POST - Criar vínculo papel-usuário
userAppRoleRouter.post("/", controller.createUserAppRole.bind(controller));

// PUT - Atualizar vínculo por ID
userAppRoleRouter.put("/:id", controller.updateUserAppRole.bind(controller));

// DELETE - Remover vínculo por ID
userAppRoleRouter.delete("/:id", controller.deleteUserAppRole.bind(controller));

// GET - Buscar vínculo por ID
userAppRoleRouter.get("/:id", controller.getUserAppRole.bind(controller));

// GET - Buscar vínculos com filtros
userAppRoleRouter.get("/", controller.findUserAppRoles.bind(controller));

export default userAppRoleRouter;
