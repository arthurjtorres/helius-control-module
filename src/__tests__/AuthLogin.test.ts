const mockFindOne = jest.fn();
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- parâmetro tipa o mock.calls
const mockSign = jest.fn((_p: unknown) => 'token');
const mockGranted = jest.fn();
const mockGroup = jest.fn();
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
jest.mock('../database/models/UserCompanyModel', () => ({ __esModule: true, default: { findAll: mockGranted } }));
jest.mock('../services/integrations/CompanyService', () => ({ ...jest.requireActual('../services/integrations/CompanyService'), getGroupCompanyIds: mockGroup }));
jest.mock('bcrypt', () => ({ compare: jest.fn(async (p: string) => p === 'ok') }));
jest.mock('../middlewares/Authentication', () => ({ sign: mockSign }));
jest.mock('../services/integrations/UserAggregator', () => ({ enrichUserData: jest.fn() }));

import AuthService from '../services/AuthService';
import { enrichUserData } from '../services/integrations/UserAggregator';
import { RegistryUnavailableError } from '../services/integrations/CompanyService';

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

describe('AuthService.login — companyIds (T18)', () => {
  const service = new AuthService();
  const company = { companyId: 'A', fkCompanyGroupId: 'G' };
  const payload = () => mockSign.mock.calls[0][0] as { companyIds: string[] };
  beforeEach(() => {
    jest.clearAllMocks();
    enrich.mockImplementation(async (u: object) => ({ ...u, employee: { Person: { fullName: 'F' }, Company: company } }));
    mockGroup.mockResolvedValue(['A', 'B', 'C']);
  });

  it('colaborador comum: a própria empresa mais as concedidas que estão no grupo', async () => {
    mockFindOne.mockResolvedValue(user({ ClearanceLevel: { clearanceName: 'USUARIO' } }));
    mockGranted.mockResolvedValue([{ fkCompanyId: 'B' }, { fkCompanyId: 'X' }]);
    expect((await service.login('u', 'ok')).status).toBe(200);
    expect(mockGroup).toHaveBeenCalledWith(company);
    expect(payload().companyIds).toEqual(['A', 'B']);
  });

  it('SUPER_ADMIN vê o grupo inteiro, sem ler user_company', async () => {
    mockFindOne.mockResolvedValue(user({ ClearanceLevel: { clearanceName: 'SUPER_ADMIN' } }));
    await service.login('u', 'ok');
    expect(payload().companyIds).toEqual(['A', 'B', 'C']);
    expect(mockGranted).not.toHaveBeenCalled();
  });

  it('registry fora ao listar o grupo: login recusado com a mensagem genérica', async () => {
    mockFindOne.mockResolvedValue(user({ ClearanceLevel: { clearanceName: 'USUARIO' } }));
    mockGroup.mockRejectedValue(new RegistryUnavailableError('x'));
    expect(await service.login('u', 'ok')).toEqual({ status: 401, message: GENERIC });
  });

  it('SISTEMA e EXTERNO: companyIds vazio, sem consultar o registry', async () => {
    mockFindOne.mockResolvedValue(user({ userType: 'SISTEMA' }));
    await service.login('u', 'ok');
    mockFindOne.mockResolvedValue(user({ userType: 'EXTERNO' }));
    await service.login('u', 'ok');
    expect(mockSign.mock.calls.map(c => (c[0] as { companyIds: string[] }).companyIds)).toEqual([[], []]);
    expect(mockGroup).not.toHaveBeenCalled();
  });
});
