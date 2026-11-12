import { Request, Response, NextFunction } from "express";
import AuthService from "../services/AuthService";
import Resp, { StandardResponse } from "../utils/Response";
import { parseLoginHeader } from "../utils/parseLoginHeader";

class AuthController {
  private service = new AuthService();

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      // Base64 de `senha;login`, separado no último `;` (a senha pode conter `;`)
      const credentials = parseLoginHeader(req.headers['authorization']);

      if (!credentials) {
        const resp = Resp.badRequest('Login e senha são obrigatórios');
        return res.status(resp.status).json({ message: resp.message });
      }

      const result: StandardResponse = await this.service.login(credentials.login, credentials.password);

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
