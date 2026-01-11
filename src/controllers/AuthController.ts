import { Request, Response, NextFunction, response } from "express";
import AuthService from "../services/AuthService";
import Resp, { StandardResponse } from "../utils/Response";

class AuthController {
  private service = new AuthService();

  async login(req: Request, res: Response, next: NextFunction) {
    try {

      const authHeader = req.headers['authorization'] as string || "";
      const [ password, login ] = atob(authHeader).split(';');      

      if (!login || !password) {
        const resp = Resp.badRequest('Login e senha são obrigatórios');
        return res.status(resp.status).json({ message: resp.message });
      }

      const result: StandardResponse = await this.service.login(login, password);

      const responseBody: any = {
        message: result.message
      };

      if ("data" in result) {
        responseBody.data = result.data;
      }

      return res.status(result.status).json(responseBody);
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;
