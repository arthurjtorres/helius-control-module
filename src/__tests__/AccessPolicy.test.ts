import { JwtPayload } from '../middlewares/Authentication';
import { actorHasModule, hasFullAccess, isStrictlyAbove, missingPermissions } from '../utils/AccessPolicy';

const user = (p: Partial<JwtPayload>): JwtPayload => ({
  userId: 'u', userName: 'u', usertag: 'u', email: 'u@example.invalid', userType: 'COLABORADOR',
  clearance: 'USUARIO', clearanceId: 'c', modules: [], roles: [], allowedMenus: [], ...p,
});
const service = { tokenType: 'service', userId: 'service:x', roles: [], modules: [], allowedMenus: [] } as unknown as JwtPayload;

describe('hasFullAccess', () => {
  it('SYSTEM_ADMIN e SUPER_ADMIN têm; ADMIN não', () => {
    expect(hasFullAccess(user({ clearance: 'SYSTEM_ADMIN' }))).toBe(true);
    expect(hasFullAccess(user({ clearance: 'SUPER_ADMIN' }))).toBe(true);
    expect(hasFullAccess(user({ clearance: 'ADMIN' }))).toBe(false);
  });
  it('role DESENVOLVEDOR tem', () => {
    expect(hasFullAccess(user({ roles: [{ module: 'CONTROLE', role: 'DESENVOLVEDOR' }] }))).toBe(true);
  });
  it('token de serviço e ausência de usuário não têm', () => {
    expect(hasFullAccess(service)).toBe(false);
    expect(hasFullAccess(undefined)).toBe(false);
  });
});

describe('isStrictlyAbove (ninguém acima do criador)', () => {
  it('só nível estritamente menor', () => {
    const admin = user({ clearance: 'ADMIN' });
    expect(isStrictlyAbove(admin, 'SUPERVISOR')).toBe(true);
    expect(isStrictlyAbove(admin, 'ADMIN')).toBe(false);
    expect(isStrictlyAbove(admin, 'SUPER_ADMIN')).toBe(false);
  });
  it('SYSTEM_ADMIN não é alcançável por ninguém, nem por outro SYSTEM_ADMIN', () => {
    expect(isStrictlyAbove(user({ clearance: 'SYSTEM_ADMIN' }), 'SYSTEM_ADMIN')).toBe(false);
    expect(isStrictlyAbove(user({ clearance: 'SUPER_ADMIN' }), 'SYSTEM_ADMIN')).toBe(false);
  });
  it('token de serviço e nível desconhecido do ator nunca concedem', () => {
    expect(isStrictlyAbove(service, 'USUARIO')).toBe(false);
    expect(isStrictlyAbove(user({ clearance: '' }), 'USUARIO')).toBe(false);
  });
});

describe('actorHasModule', () => {
  it('exige o módulo, salvo acesso total', () => {
    expect(actorHasModule(user({ modules: ['CONTROLE'] }), 'CONTROLE')).toBe(true);
    expect(actorHasModule(user({ modules: ['CONTROLE'] }), 'JURIDICO')).toBe(false);
    expect(actorHasModule(user({ clearance: 'SUPER_ADMIN' }), 'JURIDICO')).toBe(true);
  });
});

describe('missingPermissions', () => {
  const actor = user({ allowedMenus: [{ menu: 'USUARIOS', permissions: ['READ', 'CREATE'] }] });
  it('vazio quando o ator possui tudo', () => {
    expect(missingPermissions(actor, [{ menu: 'USUARIOS', permissions: ['READ'] }])).toEqual([]);
  });
  it('lista o que falta (ação ou menu inteiro)', () => {
    expect(missingPermissions(actor, [
      { menu: 'USUARIOS', permissions: ['READ', 'DELETE'] },
      { menu: 'ESTRUTURA', permissions: ['READ'] },
    ])).toEqual(['USUARIOS:DELETE', 'ESTRUTURA:READ']);
  });
  it('acesso total nunca tem faltas; ator sem menus tem todas', () => {
    expect(missingPermissions(user({ clearance: 'SUPER_ADMIN' }), [{ menu: 'X', permissions: ['READ'] }])).toEqual([]);
    expect(missingPermissions(user({}), [{ menu: 'X', permissions: ['READ'] }])).toEqual(['X:READ']);
  });
});
