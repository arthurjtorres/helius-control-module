const mockFindOne = jest.fn();
const mockEmpty = () => ({ __esModule: true, default: {} });
jest.mock('../database/models/UserModel', () => ({ __esModule: true, default: { scope: () => ({ findOne: mockFindOne }) } }));
jest.mock('../database/models/UserAppRoleModel', () => mockEmpty());
jest.mock('../database/models/EmployeeUserModel', () => mockEmpty());
jest.mock('../database/models/ExternalUserModel', () => mockEmpty());
jest.mock('../database/models/AppRoleModel', () => mockEmpty());
jest.mock('../database/models/ModuleModel', () => mockEmpty());
jest.mock('../database/models/AppRolePermitModel', () => mockEmpty());
jest.mock('../database/models/MenuModel', () => mockEmpty());
jest.mock('../database/models/PermitModel', () => mockEmpty());
jest.mock('../database/models/ClearanceLevelModel', () => mockEmpty());
jest.mock('../database/models/UserModuleModel', () => mockEmpty());
jest.mock('bcrypt', () => ({ compare: jest.fn(async (p: string) => p === 'ok') }));
jest.mock('../middlewares/Authentication', () => ({ sign: () => 'token' }));
jest.mock('../services/integrations/UserAggregator', () => ({ enrichUserData: jest.fn() }));

import AuthService from '../services/AuthService';
import { enrichUserData } from '../services/integrations/UserAggregator';

const GENERIC = 'Usuário ou senha inválidos.';
const user = (p: Record<string, unknown>) => ({
  userId: 'u', userName: 'u', password: 'h', activated: true, userType: 'COLABORADOR',
  UserAppRole: [], UserModule: [], toJSON() { return this; }, ...p,
});
const enrich = enrichUserData as jest.Mock;

describe('AuthService.login', () => {
  const service = new AuthService();
  beforeEach(() => jest.clearAllMocks());

  it('usuário inativo recebe a mesma mensagem genérica de credenciais inválidas', async () => {
    mockFindOne.mockResolvedValue(user({ activated: false }));
    expect(await service.login('u', 'ok')).toEqual({ status: 401, message: GENERIC });
  });

  it('colaborador sem funcionário ativo (inativo ou registry fora) é recusado com a mensagem genérica', async () => {
    mockFindOne.mockResolvedValue(user({}));
    enrich.mockImplementation(async (u: object) => ({ ...u, employee: null }));
    expect(await service.login('u', 'ok')).toEqual({ status: 401, message: GENERIC });
  });

  it('colaborador com funcionário ativo entra', async () => {
    mockFindOne.mockResolvedValue(user({}));
    enrich.mockImplementation(async (u: object) => ({ ...u, employee: { Person: { fullName: 'Fulano' } } }));
    expect((await service.login('u', 'ok')).status).toBe(200);
  });

  it('SISTEMA e EXTERNO não dependem do funcionário', async () => {
    enrich.mockImplementation(async (u: object) => ({ ...u, employee: null }));
    mockFindOne.mockResolvedValue(user({ userType: 'SISTEMA' }));
    expect((await service.login('u', 'ok')).status).toBe(200);
    mockFindOne.mockResolvedValue(user({ userType: 'EXTERNO' }));
    expect((await service.login('u', 'ok')).status).toBe(200);
  });
});
