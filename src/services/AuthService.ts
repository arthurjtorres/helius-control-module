import { sign } from '../jwt/jwt'; // onde está a função de assinar tokens
import Response from '../utils/Response';
import { ModelStatic, Op } from 'sequelize';
import UserModel from '../database/models/UserModel';
import bcrypt from 'bcrypt';

class AuthService {
  private model: ModelStatic<UserModel> = UserModel;

  async login(login: string, password: string) {

    try {
      // busca o usuário por email ou username
      const user = await this.model.findOne({
        where: {
          [Op.or]: [{ userName: login }, { email: login }]
        }
      });

      if (!user) {
        return Response.unauthorized("Usuário ou senha inválidos.");
      }

      // Verifica a senha
      const isMatch = await bcrypt.compare(password, user.password)
      
      if (!isMatch) {
        return Response.unauthorized("Usuário ou senha inválidos.")
      }

      if (!user.activated) {
        return Response.unauthorized("Esta conta está desativada. Entre em contato com o suporte.");
      }

      const payload = {
        userId: user.userId,
        userName: user.userName,
        email: user.email,
        userType: user.userType,
        fkClearanceId: user.fkClearanceId,
      };

      const token = sign(payload);
      return Response.ok("Autenticado com sucesso!", { token });

    } catch (error: any) {
      // Padronizando erro conforme seu arquivo Response
      return Response.internalError("Erro ao processar autenticação.");
    }
  }
}

export default AuthService;
