import { Router } from "express";
import PermitController from "../controllers/PermitController";
import { verifyToken } from "./middlewares/Authentication";

const permitRouter = Router();
const controller = new PermitController();

// POST - Criar permissão
permitRouter.post("/", verifyToken, controller.createPermit.bind(controller));

// PUT - Atualizar permissão
permitRouter.put("/:id", verifyToken, controller.updatePermit.bind(controller));

// DELETE - Remover permissão
permitRouter.delete("/:id", verifyToken, controller.deletePermit.bind(controller));

// GET - Buscar permissão por ID
permitRouter.get("/:id", controller.getPermit.bind(controller));

// GET - Buscar permissões com filtro (via query)
permitRouter.get("/", controller.findPermits.bind(controller));

export default permitRouter;
