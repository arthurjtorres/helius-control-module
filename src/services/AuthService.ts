import { sign } from '../middlewares/Authentication'; // onde está a função de assinar tokens
import Response from '../utils/Response';
import { ModelStatic, Op } from 'sequelize';
import UserModel from '../database/models/UserModel';
import bcrypt from 'bcrypt';
import UserAppRoleModel from '../database/models/UserAppRoleModel';
import EmployeeUserModel from '../database/models/EmployeeUserModel';
import ExternalUserModel from '../database/models/ExternalUserModel';

class AuthService {
  private modelUser: ModelStatic<UserModel> = UserModel;
  private modelUserRole: ModelStatic<UserAppRoleModel> = UserAppRoleModel;  

  async login(login: string, password: string) {

    try {
      // busca o usuário por email ou username
      const user = await this.modelUser.findOne({
        where: {
          [Op.or]: [{ userName: login }, { email: login }]
        }, include: [
          { model: EmployeeUserModel, as: 'employeeLink' },
          { model: ExternalUserModel, as: 'externalLink' },
        ]
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

      // fazer a requisição direto ao metodo get com id do userService e pegar os dados completos
      // Nome da pessoa, Modulos, menus, permissões, etc...
      

      const payload = {
        userId: user.userId,
        
        usertag: user.userName,
        email: user.email,
        userType: user.userType,
        clearance: user.fkClearanceId,
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
