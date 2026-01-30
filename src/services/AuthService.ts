import { sign } from '../middlewares/Authentication'; // onde está a função de assinar tokens
import Response from '../utils/Response';
import { ModelStatic, Op } from 'sequelize';
import UserModel from '../database/models/UserModel';
import bcrypt from 'bcrypt';
import UserAppRoleModel from '../database/models/UserAppRoleModel';
import EmployeeUserModel from '../database/models/EmployeeUserModel';
import ExternalUserModel from '../database/models/ExternalUserModel';

import { enrichUserData } from './integrations/UserAggregator';
import AppRoleModel from '../database/models/AppRoleModel';
import ModuleModel from '../database/models/ModuleModel';

interface MenuPermission {
  menu: string;
  permissions: string [];
}

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
          {
            model: UserAppRoleModel,
            as: 'userAppRoles',
            include: [
              { model: AppRoleModel, as: 'role' },
              { model: ModuleModel, as: 'module' },
            ]
          },

        ],
      });

      if (!user) {
        return Response.unauthorized("Usuário ou senha inválidos.");
      }

      // Verifica a senha
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return Response.unauthorized("Usuário ou senha inválidos.");
      }

      if (!user.activated) {
        return Response.unauthorized("Esta conta está desativada. Entre em contato com o suporte.");
      }

      // fazer a requisição direto ao metodo get com id do userService e pegar os dados completos
      // Nome da pessoa, Modulos, menus, permissões, etc...
      
      const enrichedUser = await enrichUserData(user.toJSON());

      // Lógica para extrair o Nome Completo baseado no retorno da integração
      let fullName = user.userName; // Fallback
      
      // Verifica se é Colaborador e acessa 'PersonModel' 
      if (enrichedUser.employee && enrichedUser.employee.PersonModel) {
        fullName = enrichedUser.employee.PersonModel.fullName;
      } 
      // Verifica se é Externo
      else if (enrichedUser.person && enrichedUser.person.fullName) {
        fullName = enrichedUser.person.fullName;
      }

      //Busca de permissões
      const securityContext = await this.getUserContext(user.userId);

      
      const payload = {
        userId: user.userId,
        userName: fullName, // Agora preenchido via API Externa
        usertag: user.userName,
        email: user.email,
        userType: user.userType,
        clearance: user.fkClearanceId,
        moduleName: securityContext.moduleName,
        allowedMenus: securityContext.allowedMenus,
      };

      
      const token = sign(payload);
      return Response.ok("Autenticado com sucesso!", { token });

    } catch (error: any) {
      // Padronizando erro conforme seu arquivo Response
      return Response.internalError("Erro ao processar autenticação.");
    }
  }

  /**
   * Método Privado para buscar permissões complexas no banco.
   * Simula a busca na tabela App-Role-Permit e Module.
   */
  private async getUserContext(userId: string): Promise<{ moduleName: string, allowedMenus: MenuPermission[] }> {
    try {
      // Exemplo de Query com Sequelize. 
      // Como não tenho seus models de Permissão/Menu, vou simular a lógica:
      
      // 1. Buscar as Roles do usuário
      const userRoles = await this.modelUserRole.findAll({
        where: { fkUserId: userId },
        // include: [{ model: AppRoleModel, include: [ModuleModel] }] // Exemplo de Join
      });

      // MOCK DE DADOS (Substitua pela sua query real do Sequelize acima)
      // Aqui você percorreria userRoles -> AppRole -> Permissions -> Menus
      
      // Lógica fictícia: Se o usuário tem role com ID X, ele é do Jurídico
      // Na prática, você pegaria isso do 'include: [ModuleModel]'
      
      const moduleName = "JURIDICO"; // Valor vindo do banco

      // Mapear as permissões vindas do banco para o formato do Token
      const allowedMenus: MenuPermission[] = [
        { menu: 'NOTIFICAÇÕES', permissions: ['READ', 'CREATE'] },
        { menu: 'PROCESSOS', permissions: ['READ'] }
      ];

      return { moduleName, allowedMenus };

    } catch (error) {
      console.error("Erro ao buscar contexto de segurança", error);
      // Retorna permissões vazias em caso de erro para não quebrar o login,
      // mas o usuário não conseguirá acessar nada.
      return { moduleName: '', allowedMenus: [] };
    }
  }
}

export default AuthService;