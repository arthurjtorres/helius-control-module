import { Request, Response as ExpressResponse } from 'express';
import { JwtPayload } from '../middlewares/Authentication';
import { checkPermission, checkPermissionOrSelf, evaluatePermission, requireMinClearance } from '../middlewares/CheckPermission';
import { PermissionEnum } from '../database/models/enums/PermissionEnum';
import { ClearanceEnum } from '../database/models/enums/ClearanceEnum';

const user = (p: Partial<JwtPayload>): JwtPayload => ({
  userId: 'u1', userName: 'u', usertag: 'u', email: 'u@example.invalid', userType: 'COLABORADOR',
  clearance: 'USUARIO', clearanceId: 'c', modules: ['CONTROLE'],
  roles: [], allowedMenus: [{ menu: 'USUARIOS', permissions: ['READ', 'CREATE'] }], ...p,
});
const service = { tokenType: 'service', userId: 'service:x', roles: [], modules: [], allowedMenus: [] } as unknown as JwtPayload;

type Middleware = (q: Request, s: ExpressResponse, n: () => void) => unknown;

/** Executa o middleware e devolve o status (0 se não respondeu) e se chamou `next`. */
const run = (mw: Middleware, u: JwtPayload | undefined, method = 'GET', params: Record<string, string> = {}) => {
  const out = { status: 0, next: false };
  const res = {
    locals: { user: u },
    status(code: number) { out.status = code; return this; },
    json() { return this; },
  } as unknown as ExpressResponse;
  mw({ method, params } as unknown as Request, res, () => { out.next = true; });
  return out;
};

describe('evaluatePermission', () => {
  it('sem usuário → 401', () => {
    expect(evaluatePermission(undefined, 'GET', 'USUARIOS')?.status).toBe(401);
  });
  it('token de serviço: GET e HEAD passam, escrita → 403', () => {
    expect(evaluatePermission(service, 'GET', 'USUARIOS', PermissionEnum.READ)).toBeNull();
    expect(evaluatePermission(service, 'HEAD', 'USUARIOS', PermissionEnum.READ)).toBeNull();
    expect(evaluatePermission(service, 'POST', 'USUARIOS', PermissionEnum.CREATE)?.status).toBe(403);
    expect(evaluatePermission(service, 'DELETE', 'USUARIOS', PermissionEnum.DELETE)?.status).toBe(403);
  });
  it('SYSTEM_ADMIN, SUPER_ADMIN e DESENVOLVEDOR passam em tudo', () => {
    expect(evaluatePermission(user({ clearance: 'SYSTEM_ADMIN', modules: [] }), 'DELETE', 'X', PermissionEnum.DELETE)).toBeNull();
    expect(evaluatePermission(user({ clearance: 'SUPER_ADMIN', modules: [] }), 'DELETE', 'X', PermissionEnum.DELETE)).toBeNull();
    expect(evaluatePermission(user({ modules: [], roles: [{ module: 'CONTROLE', role: 'DESENVOLVEDOR' }] }), 'DELETE', 'X', PermissionEnum.DELETE)).toBeNull();
  });
  it('ADMIN não tem bypass: depende de módulo, menu e ação', () => {
    expect(evaluatePermission(user({ clearance: 'ADMIN', allowedMenus: [] }), 'GET', 'USUARIOS', PermissionEnum.READ)?.status).toBe(403);
  });
  it('sem o módulo → 403', () => {
    expect(evaluatePermission(user({ modules: ['JURIDICO'] }), 'GET', 'USUARIOS', PermissionEnum.READ)?.status).toBe(403);
  });
  it('sem o menu → 403', () => {
    expect(evaluatePermission(user({}), 'GET', 'ESTRUTURA', PermissionEnum.READ)?.status).toBe(403);
  });
  it('menu sem a ação → 403 (antes não bloqueava)', () => {
    expect(evaluatePermission(user({}), 'DELETE', 'USUARIOS', PermissionEnum.DELETE)?.status).toBe(403);
  });
  it('com módulo, menu e ação → permitido', () => {
    expect(evaluatePermission(user({}), 'POST', 'USUARIOS', PermissionEnum.CREATE)).toBeNull();
  });
  it('payload sem roles, modules e allowedMenus não quebra (TypeError)', () => {
    const quebrado = { userId: 'u', clearance: 'USUARIO' } as unknown as JwtPayload;
    expect(() => evaluatePermission(quebrado, 'GET', 'USUARIOS', PermissionEnum.READ)).not.toThrow();
    expect(evaluatePermission(quebrado, 'GET', 'USUARIOS', PermissionEnum.READ)?.status).toBe(403);
  });
});

describe('middlewares', () => {
  it('checkPermission responde 403 e não chama next', () => {
    const r = run(checkPermission('USUARIOS', PermissionEnum.DELETE), user({}), 'DELETE');
    expect(r.status).toBe(403);
    expect(r.next).toBe(false);
  });
  it('checkPermission chama next quando permitido', () => {
    const r = run(checkPermission('USUARIOS', PermissionEnum.READ), user({}));
    expect(r.next).toBe(true);
    expect(r.status).toBe(0);
  });
  it('checkPermissionOrSelf libera o próprio cadastro sem permissão de menu', () => {
    const mw = checkPermissionOrSelf('USUARIOS', PermissionEnum.UPDATE);
    expect(run(mw, user({ allowedMenus: [] }), 'PUT', { id: 'u1' }).next).toBe(true);
    expect(run(mw, user({ allowedMenus: [] }), 'PUT', { id: 'outro' }).status).toBe(403);
  });
  it('checkPermissionOrSelf não libera token de serviço', () => {
    const mw = checkPermissionOrSelf('USUARIOS', PermissionEnum.UPDATE);
    expect(run(mw, { ...service, userId: 'u1' } as JwtPayload, 'PUT', { id: 'u1' }).status).toBe(403);
  });
  it('requireMinClearance: ADMIN passa; SUPERVISOR, serviço e DESENVOLVEDOR sem nível não', () => {
    const mw = requireMinClearance(ClearanceEnum.ADMIN);
    expect(run(mw, user({ clearance: 'ADMIN' })).next).toBe(true);
    expect(run(mw, user({ clearance: 'SUPERVISOR' })).status).toBe(403);
    expect(run(mw, service).status).toBe(403);
    expect(run(mw, user({ roles: [{ module: 'CONTROLE', role: 'DESENVOLVEDOR' }] })).status).toBe(403);
    expect(run(mw, undefined).status).toBe(401);
  });
});
