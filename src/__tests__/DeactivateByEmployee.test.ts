import { Request, Response as ExpressResponse } from 'express';
import { Op } from 'sequelize';

const mockTx = { commit: jest.fn(), rollback: jest.fn() };
function mockModel() { return ({ __esModule: true, default: { findAll: jest.fn(), update: jest.fn(), destroy: jest.fn() } }); }
jest.mock('../database/models/index', () => ({ __esModule: true, default: { transaction: jest.fn(async () => mockTx) } }));
jest.mock('../database/models/UserModel', () => mockModel());
jest.mock('../database/models/EmployeeUserModel', () => mockModel());
jest.mock('../database/models/UserModuleModel', () => mockModel());
jest.mock('../database/models/UserAppRoleModel', () => mockModel());
jest.mock('../database/models/ExternalUserModel', () => mockModel());
jest.mock('../database/models/AppRoleModel', () => mockModel());
jest.mock('../database/models/ModuleModel', () => mockModel());
jest.mock('../database/models/ClearanceLevelModel', () => mockModel());
jest.mock('../services/GrantGuard', () => ({ __esModule: true, default: {} }));
jest.mock('../services/integrations/UserAggregator', () => ({ enrichUserData: jest.fn() }));

import UserService from '../services/UserService';
import UserModel from '../database/models/UserModel';
import EmployeeUserModel from '../database/models/EmployeeUserModel';
import UserModuleModel from '../database/models/UserModuleModel';
import UserAppRoleModel from '../database/models/UserAppRoleModel';
import { requireServiceToken } from '../middlewares/CheckPermission';
import { JwtPayload } from '../middlewares/Authentication';

const EMP = '11111111-1111-4111-8111-111111111111';
const ACTOR = '22222222-2222-4222-8222-222222222222';
const USER = '33333333-3333-4333-8333-333333333333';
const m = (model: unknown) => model as Record<string, jest.Mock>;

describe('UserService.deactivateByEmployee', () => {
  const service = new UserService();
  beforeEach(() => jest.clearAllMocks());

  it('valida employeeIds e updatedBy', async () => {
    expect((await service.deactivateByEmployee([], ACTOR)).status).toBe(400);
    expect((await service.deactivateByEmployee(['x'], ACTOR)).status).toBe(400);
    expect((await service.deactivateByEmployee([EMP], 'service:registry')).status).toBe(400);
    expect((await service.deactivateByEmployee(Array(5001).fill(EMP), ACTOR)).status).toBe(400);
  });

  it('desativa o usuário e remove user_module e user_app_role na mesma transação, sem tocar no SISTEMA', async () => {
    m(EmployeeUserModel).findAll.mockResolvedValue([{ fkUserId: USER }]);
    m(UserModel).findAll.mockResolvedValue([{ userId: USER }]);

    const result = await service.deactivateByEmployee([EMP], ACTOR);

    expect(result.status).toBe(200);
    expect((result as unknown as { data: unknown }).data).toEqual({ deactivated: [USER] });
    const { where } = m(UserModel).findAll.mock.calls[0][0];
    expect(where.userId[Op.in]).toEqual([USER]);
    expect(where.userType[Op.ne]).toBe('SISTEMA');
    const [values, opts] = m(UserModel).update.mock.calls[0];
    expect(values).toMatchObject({ activated: false, updatedBy: ACTOR });
    expect(opts.transaction).toBe(mockTx);
    expect(m(UserModuleModel).destroy.mock.calls[0][0].transaction).toBe(mockTx);
    expect(m(UserAppRoleModel).destroy.mock.calls[0][0].transaction).toBe(mockTx);
    expect(mockTx.commit).toHaveBeenCalled();
  });

  it('sem usuário vinculado: 200 sem abrir transação', async () => {
    m(EmployeeUserModel).findAll.mockResolvedValue([]);
    const result = await service.deactivateByEmployee([EMP], ACTOR);
    expect(result.status).toBe(200);
    expect(m(UserModel).update).not.toHaveBeenCalled();
  });

  it('erro no meio desfaz tudo (rollback) e responde 500', async () => {
    m(EmployeeUserModel).findAll.mockResolvedValue([{ fkUserId: USER }]);
    m(UserModel).findAll.mockResolvedValue([{ userId: USER }]);
    m(UserAppRoleModel).destroy.mockRejectedValueOnce(new Error('falha'));
    const result = await service.deactivateByEmployee([EMP], ACTOR);
    expect(result.status).toBe(500);
    expect(mockTx.rollback).toHaveBeenCalled();
    expect(mockTx.commit).not.toHaveBeenCalled();
  });
});

describe('requireServiceToken', () => {
  const run = (user: Partial<JwtPayload>) => {
    const out = { status: 0, next: false };
    const res = { locals: { user }, status(c: number) { out.status = c; return this; }, json() { return this; } };
    requireServiceToken({} as Request, res as unknown as ExpressResponse, () => { out.next = true; });
    return out;
  };
  it('token de serviço passa', () => expect(run({ tokenType: 'service' }).next).toBe(true));
  it('token de usuário, mesmo SYSTEM_ADMIN, → 403', () => {
    expect(run({ clearance: 'SYSTEM_ADMIN', userType: 'SISTEMA' })).toEqual({ status: 403, next: false });
  });
});
