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
import PermitModel from '../database/models/PermitModel';
import ClearanceLevelModel from '../database/models/ClearanceLevelModel';
import UserModuleModel from '../database/models/UserModuleModel';
import { MenuPermission, UserModuleRole } from '../middlewares/Authentication';
import { logError } from "../utils/logError";

/** Vínculo role → menu → permissão, como carregado no login. */
interface AppRolePermitWithRelations extends AppRolePermitModel {
  Menu?: MenuModel | null;
  Permit?: PermitModel | null;
}

interface AppRoleWithRelations extends AppRoleModel {
  AppRolePermit?: AppRolePermitWithRelations[];
}

/** Vínculo usuário → role (num módulo), como carregado no login. */
interface UserAppRoleWithRelations extends UserAppRoleModel {
  Module?: ModuleModel | null;
  AppRole?: AppRoleWithRelations | null;
}

/** Vínculo usuário → módulo (acesso ao módulo), como carregado no login. */
interface UserModuleWithRelations extends UserModuleModel {
  Module?: ModuleModel | null;
}

interface UserWithAssociations extends UserModel {
  EmployeeUser?: EmployeeUserModel | null;
  ExternalUser?: ExternalUserModel | null;
  ClearanceLevel?: ClearanceLevelModel | null;
  UserAppRole?: UserAppRoleWithRelations[];
  UserModule?: UserModuleWithRelations[];
}

/** Acesso do usuário consolidado para o payload do JWT. */
interface UserAccess {
  modules: string[];
  roles: UserModuleRole[];
  permissions: MenuPermission[];
}

/**
 * Consolida módulos, roles e permissões por menu a partir dos vínculos do usuário.
 *
 * - `modules`: vem de `user_module` (acesso ao módulo); ignora vínculo expirado.
 * - `roles` e `permissions`: vêm de `user_app_role` → `app_role` → `app_role_permit`
 *   (`Menu` + `Permit.permitList`); permissões do mesmo menu são unidas sem duplicar.
 * - Registros com `activated = false` (vínculo, módulo, role, menu ou permit) e
 *   relações ausentes são ignorados.
 *
 * @param userAppRoles Vínculos usuário-role carregados com `Module` e `AppRole`.
 * @param userModules Vínculos usuário-módulo carregados com `Module`.
 * @param now Instante de referência para validade do acesso (injetável em testes).
 */
export const mapUserAccess = (
  userAppRoles: UserAppRoleWithRelations[] = [],
  userModules: UserModuleWithRelations[] = [],
  now: Date = new Date()
): UserAccess => {
  const modules = new Set<string>();
  userModules.forEach(link => {
    const mod = link.Module;
    if (!link.activated || !mod?.activated || !mod.moduleName) return;
    if (new Date(link.expiresAt) <= now) return;
    modules.add(mod.moduleName);
  });

  const roles = new Map<string, UserModuleRole>();
  const permissionsByMenu = new Map<string, Set<string>>();

  userAppRoles.forEach(link => {
    const mod = link.Module;
    const role = link.AppRole;
    if (!link.activated || !mod?.activated || !role?.activated) return;

    roles.set(`${mod.moduleName}|${role.appRoleName}`, {
      module: mod.moduleName,
      role: role.appRoleName,
    });

    (role.AppRolePermit ?? []).forEach(rolePermit => {
      const menu = rolePermit.Menu;
      const permit = rolePermit.Permit;
      if (!rolePermit.activated || !menu?.activated || !permit?.activated) return;

      const actions = permissionsByMenu.get(menu.menuName) ?? new Set<string>();
      (permit.permitList ?? []).forEach(action => actions.add(action));
      permissionsByMenu.set(menu.menuName, actions);
    });
  });

  return {
    modules: Array.from(modules),
    roles: Array.from(roles.values()),
    permissions: Array.from(permissionsByMenu.entries()).map(([menu, actions]) => ({
      menu,
      permissions: Array.from(actions),
    })),
  };
};

class AuthService {
  private modelUser: ModelStatic<UserModel> = UserModel;
  private modelUserRole: ModelStatic<UserAppRoleModel> = UserAppRoleModel;

  async login(login: string, password: string) {
    try {
      // busca o usuário por email ou username
      const user = await this.modelUser.scope('withPassword').findOne({
        where: {
          [Op.or]: [{ userName: login }, { email: login }]
        }, include: [
          { model: EmployeeUserModel, as: 'EmployeeUser' },
          { model: ExternalUserModel, as: 'ExternalUser' },
          { model: ClearanceLevelModel, as: 'ClearanceLevel' },
          { model: UserModuleModel, as: 'UserModule', include: [{ model: ModuleModel, as: 'Module' }] },
          {
            model: UserAppRoleModel,
            as: 'UserAppRole',
            include: [
              { model: ModuleModel, as: 'Module' },
              {
                model: AppRoleModel,
                as: 'AppRole',
                include: [{
                  model: AppRolePermitModel,
                  as: 'AppRolePermit',
                  include: [
                    { model: MenuModel, as: 'Menu' },
                    { model: PermitModel, as: 'Permit' }
                  ]
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
      const accessData = mapUserAccess(user.UserAppRole, user.UserModule);

      const payload = {
        userId: user.userId,
        userName: fullName,
        usertag: user.userName,
        email: user.email,
        userType: user.userType,
        clearance: user.ClearanceLevel?.clearanceName ?? '',
        clearanceId: user.fkClearanceId,

        modules: accessData.modules,
        roles: accessData.roles,
        allowedMenus: accessData.permissions
      };


      const token = sign(payload);
      return Response.ok("Autenticado com sucesso!", { token });

    } catch (error: unknown) {
      // Detalhe só no log do servidor (sem senha nem token); o cliente recebe mensagem genérica
      logError("login", error);
      return Response.internalError("Erro ao processar autenticação.");
    }
  }
}

export default AuthService;