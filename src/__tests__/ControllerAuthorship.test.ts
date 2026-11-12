import { Request, Response } from 'express';

/** Service simulado: devolve 200 e guarda os argumentos recebidos. */
const fakeService = () => {
  const ok = jest.fn(async () => ({ status: 200, message: 'ok' }));
  return new Proxy({} as Record<string, jest.Mock>, {
    get: (target, prop: string) => (target[prop] ??= jest.fn(ok)),
  });
};
const instances: Record<string, Record<string, jest.Mock>> = {};
const mockService = (name: string) => ({
  __esModule: true,
  default: jest.fn(() => (instances[name] ??= fakeService())),
});

jest.mock('../services/MenuService', () => mockService('Menu'));
jest.mock('../services/ModuleService', () => mockService('Module'));
jest.mock('../services/AppRoleService', () => mockService('AppRole'));
jest.mock('../services/PermitService', () => mockService('Permit'));
jest.mock('../services/ClearanceLevelService', () => mockService('ClearanceLevel'));
jest.mock('../services/AppRolePermitService', () => mockService('AppRolePermit'));

import MenuController from '../controllers/MenuController';
import ModuleController from '../controllers/ModuleController';
import AppRoleController from '../controllers/AppRoleController';
import PermitController from '../controllers/PermitController';
import ClearanceLevelController from '../controllers/ClearanceLevelController';
import AppRolePermitController from '../controllers/AppRolePermitController';

const TOKEN_USER = 'token-user-id';
const FORGED = 'forjado-no-body';

const mockRes = () => {
  const res: any = { locals: { user: { userId: TOKEN_USER } } };
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res as Response;
};

const cases: Array<[string, any]> = [
  ['Menu', MenuController],
  ['Module', ModuleController],
  ['AppRole', AppRoleController],
  ['Permit', PermitController],
  ['ClearanceLevel', ClearanceLevelController],
  ['AppRolePermit', AppRolePermitController],
];

describe.each(cases)('%sController: autoria pelo token', (name, Controller) => {
  const controller = new Controller();

  it(`create${name} ignora createdBy do body e usa o do token`, async () => {
    const req = { body: { name: 'ZZ_TEST_x', createdBy: FORGED }, params: {} } as unknown as Request;
    await controller[`create${name}`](req, mockRes(), jest.fn());
    const [data] = instances[name][`create${name}`].mock.lastCall!;
    expect(data).toEqual({ name: 'ZZ_TEST_x', createdBy: TOKEN_USER });
  });

  it(`update${name} ignora updatedBy do body e usa o do token`, async () => {
    const req = { body: { name: 'ZZ_TEST_y', updatedBy: FORGED }, params: { id: 'abc' } } as unknown as Request;
    await controller[`update${name}`](req, mockRes(), jest.fn());
    const [id, data] = instances[name][`update${name}`].mock.lastCall!;
    expect(id).toBe('abc');
    expect(data).toEqual({ name: 'ZZ_TEST_y', updatedBy: TOKEN_USER });
  });
});
