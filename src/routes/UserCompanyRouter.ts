import { Router } from "express";
import UserCompanyController from "../controllers/UserCompanyController";
import { verifyToken } from "../middlewares/Authentication";
import { checkPermission } from "../middlewares/CheckPermission";
import { PermissionEnum } from "../database/models/enums/PermissionEnum";

/** Empresas concedidas ao usuário (T18). Clearance e grupo são conferidos no service. */
const userCompanyRouter = Router();
userCompanyRouter.use(verifyToken);
const controller = new UserCompanyController();

userCompanyRouter.get("/", checkPermission("PERMISSOES", PermissionEnum.READ), controller.findByUser.bind(controller));
userCompanyRouter.post("/", checkPermission("PERMISSOES", PermissionEnum.CREATE), controller.create.bind(controller));
userCompanyRouter.delete("/:userId/:companyId", checkPermission("PERMISSOES", PermissionEnum.DELETE), controller.remove.bind(controller));

export default userCompanyRouter;
