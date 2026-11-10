import { Router } from "express";
import PermitController from "../controllers/PermitController";
import { verifyToken } from "../middlewares/Authentication";

const permitRouter = Router();

// Todas as rotas deste router exigem token JWT válido
permitRouter.use(verifyToken);
const controller = new PermitController();

// POST - Criar permissão
permitRouter.post("/", controller.createPermit.bind(controller));

// PUT - Atualizar permissão
permitRouter.put("/:id", controller.updatePermit.bind(controller));

// DELETE - Remover permissão
permitRouter.delete("/:id", controller.deletePermit.bind(controller));

// PATCH - Reativação (activated = true)
permitRouter.patch("/:id/reactivate", controller.reactivatePermit.bind(controller));

// GET - Buscar permissão por ID
permitRouter.get("/:id", controller.getPermit.bind(controller));

// GET - Buscar permissões com filtro (via query)
permitRouter.get("/", controller.findPermits.bind(controller));

export default permitRouter;
