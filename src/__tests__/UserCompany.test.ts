const mockUserCompany = { findOne: jest.fn(), findAll: jest.fn(), create: jest.fn(), destroy: jest.fn() };
const mockUserFindOne = jest.fn();
const mockCanManageUser = jest.fn();
const mockGetEmployee = jest.fn();
const mockAxiosGet = jest.fn();
jest.mock('../database/models/UserCompanyModel', () => ({ __esModule: true, default: mockUserCompany }));
jest.mock('../database/models/UserModel', () => ({ __esModule: true, default: { findOne: mockUserFindOne } }));
jest.mock('../database/models/EmployeeUserModel', () => ({ __esModule: true, default: {} }));
jest.mock('../services/GrantGuard', () => ({ __esModule: true, default: { canManageUser: mockCanManageUser } }));
jest.mock('../services/integrations/EmployeeService', () => ({ getEmployeeById: mockGetEmployee }));
jest.mock('../services/integrations/axiosInstance', () => ({ __esModule: true, default: { get: mockAxiosGet } }));

import UserCompanyService from '../services/UserCompanyService';
import { getGroupCompanyIds, RegistryUnavailableError } from '../services/integrations/CompanyService';
import { JwtPayload } from '../middlewares/Authentication';

const USER = '33333333-3333-4333-8333-333333333333';
const OWN = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const SIBLING = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const OTHER = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const GROUP = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const actor = (p: Partial<JwtPayload> = {}) => ({ userId: 'actor', userType: 'COLABORADOR', clearance: 'SUPER_ADMIN', companyIds: [OWN, SIBLING], ...p }) as JwtPayload;

describe('UserCompanyService', () => {
  const service = new UserCompanyService();
  beforeEach(() => {
    jest.clearAllMocks();
    mockCanManageUser.mockResolvedValue(null);
    mockUserFindOne.mockResolvedValue({ EmployeeUser: { fkEmployeeId: 'e1' } });
    mockGetEmployee.mockResolvedValue({ Company: { companyId: OWN, fkCompanyGroupId: GROUP } });
    mockAxiosGet.mockResolvedValue({ data: { data: [{ companyId: OWN }, { companyId: SIBLING }] } });
    mockUserCompany.findOne.mockResolvedValue(null);
  });

  it('concede empresa do mesmo grupo e grava quem concedeu', async () => {
    const res = await service.create({ fkUserId: USER, fkCompanyId: SIBLING }, actor());
    expect(res.status).toBe(201);
    expect(mockUserCompany.create).toHaveBeenCalledWith(expect.objectContaining({ fkUserId: USER, fkCompanyId: SIBLING, createdBy: 'actor' }));
    expect(mockAxiosGet).toHaveBeenCalledWith('/company', { params: { fkCompanyGroupId: GROUP } });
  });

  it('recusa empresa de outro grupo, a própria empresa e vínculo repetido', async () => {
    expect((await service.create({ fkUserId: USER, fkCompanyId: OTHER }, actor({ companyIds: [OTHER] }))).status).toBe(400);
    expect((await service.create({ fkUserId: USER, fkCompanyId: OWN }, actor())).status).toBe(400);
    mockUserCompany.findOne.mockResolvedValue({});
    expect((await service.create({ fkUserId: USER, fkCompanyId: SIBLING }, actor())).status).toBe(409);
    expect(mockUserCompany.create).not.toHaveBeenCalled();
  });

  it('só SISTEMA, SYSTEM_ADMIN ou SUPER_ADMIN concedem, e só empresa que eles veem', async () => {
    expect((await service.create({ fkUserId: USER, fkCompanyId: SIBLING }, actor({ clearance: 'ADMIN' }))).status).toBe(403);
    expect((await service.create({ fkUserId: USER, fkCompanyId: SIBLING }, actor({ companyIds: [OWN] }))).status).toBe(403);
    expect((await service.create({ fkUserId: USER, fkCompanyId: SIBLING }, actor({ userType: 'SISTEMA', clearance: 'SYSTEM_ADMIN', companyIds: [] }))).status).toBe(201);
  });

  it('alvo de nível igual ou acima: devolve a negação do GrantGuard', async () => {
    mockCanManageUser.mockResolvedValue({ status: 403, message: 'x' });
    expect((await service.create({ fkUserId: USER, fkCompanyId: SIBLING }, actor())).status).toBe(403);
  });

  it('usuário sem funcionário ativo → 400; registry fora → 503; ids inválidos → 400', async () => {
    mockGetEmployee.mockResolvedValue(null);
    expect((await service.create({ fkUserId: USER, fkCompanyId: SIBLING }, actor())).status).toBe(400);
    mockGetEmployee.mockResolvedValue({ Company: { companyId: OWN, fkCompanyGroupId: GROUP } });
    mockAxiosGet.mockRejectedValue(new Error('ECONNREFUSED'));
    expect((await service.create({ fkUserId: USER, fkCompanyId: SIBLING }, actor())).status).toBe(503);
    expect((await service.create({ fkUserId: 'x', fkCompanyId: SIBLING }, actor())).status).toBe(400);
  });

  it('remove o vínculo fisicamente; inexistente → 404', async () => {
    mockUserCompany.destroy.mockResolvedValue(1);
    expect((await service.remove(USER, SIBLING, actor())).status).toBe(200);
    expect(mockUserCompany.destroy).toHaveBeenCalledWith({ where: { fkUserId: USER, fkCompanyId: SIBLING } });
    mockUserCompany.destroy.mockResolvedValue(0);
    expect((await service.remove(USER, SIBLING, actor())).status).toBe(404);
  });

  it('lista as empresas do usuário (vazia é 200)', async () => {
    mockUserCompany.findAll.mockResolvedValue([]);
    expect((await service.findByUser(USER)).status).toBe(200);
    expect((await service.findByUser('x')).status).toBe(400);
  });
});

describe('getGroupCompanyIds', () => {
  beforeEach(() => jest.clearAllMocks());

  it('empresa sem grupo: só ela; 404 do registry: nenhuma; outro erro: RegistryUnavailableError', async () => {
    expect(await getGroupCompanyIds({ companyId: OWN, fkCompanyGroupId: null })).toEqual([OWN]);
    expect(mockAxiosGet).not.toHaveBeenCalled();
    mockAxiosGet.mockRejectedValueOnce({ response: { status: 404 } });
    expect(await getGroupCompanyIds({ companyId: OWN, fkCompanyGroupId: GROUP })).toEqual([]);
    mockAxiosGet.mockRejectedValueOnce(new Error('timeout'));
    await expect(getGroupCompanyIds({ companyId: OWN, fkCompanyGroupId: GROUP })).rejects.toBeInstanceOf(RegistryUnavailableError);
  });
});
