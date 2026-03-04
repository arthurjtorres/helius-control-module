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
import AppRolePermitModel from '../database/models/AppRolePermitModel';
import MenuModel from '../database/models/MenuModel';

interface MenuPermission {
  menu: string;
  permissions: string[];
}

interface UserWithAssociations extends UserModel {
  userAppRoles: UserAppRoleModel[]; // Substitua 'any' pelo seu Model UserAppRole se possível
  employeeLink?: any;
  externalLink?: any;
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
              { model: ModuleModel, as: 'module' },
              {
                model: AppRoleModel,
                as: 'role',
                include: [{
                  model: AppRolePermitModel,
                  as: 'rolePermits',
                  include: [{
                    model: MenuModel,
                    as: 'menu'
                  }]
                }]
              }
            ]
          },

        ],
      }) as UserWithAssociations | null;

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

      const enrichedUser = await enrichUserData(user.toJSON());

      // Lógica para extrair o Nome Completo baseado no retorno da integração
      let fullName = user.userName; // Fallback

      // Verifica se é Colaborador e acessa 'PersonModel' 
      if (enrichedUser.employee && enrichedUser.employee.Person) {
        fullName = enrichedUser.employee.Person?.fullName;
      }
      // Verifica se é Externo
      else if (enrichedUser.person && enrichedUser.person.fullName) {
        fullName = enrichedUser.person.fullName;
      }

      //Busca de permissões
      const accessData = this.mapUserAccess(user.userAppRoles);

      const payload = {
        userId: user.userId,
        userName: fullName,
        usertag: user.userName,
        email: user.email,
        userType: user.userType,
        clearance: user.fkClearanceId,

        modules: accessData.modules,
        roles: accessData.roles,
        allowedMenus: accessData.permissions
      };


      const token = sign(payload);
      return Response.ok("Autenticado com sucesso!", { token });

    } catch (error: any) {
      return Response.internalError("Erro ao processar autenticação: " + error.message);
    }
  }


  private mapUserAccess(userAppRoles: any[]) {
    if (!userAppRoles || userAppRoles.length === 0) {
      return { modules: [], roles: [], permissions: [] };
    }

    const modules: string[] = [];
    const roles: any[] = [];
    const permissionsMap = new Map<string, Set<string>>();

    userAppRoles.forEach(appRole => {
      const modName = appRole.module?.moduleName;
      if (modName && !modules.includes(modName)) {
        modules.push(modName);
      }

      roles.push({
        module: modName,
        role: appRole.role?.appRoleName
      });

      if (appRole.role && appRole.role.permits) {
        appRole.role.permits.forEach((permit: any) => {
          const menuName = permit.menu?.menuName; 
          const action = permit.actionName;

          if (menuName && action) {
            if (!permissionsMap.has(menuName)) {
              permissionsMap.set(menuName, new Set());
            }
            permissionsMap.get(menuName)?.add(action);
          }
        });
      }
    });

    const permissionsArray = Array.from(permissionsMap.entries()).map(([menu, actionsSet]) => ({
      menu: menu,
      permissions: Array.from(actionsSet)
    }));

    return { modules, roles, permissions: permissionsArray };

  }  
}

export default AuthService;