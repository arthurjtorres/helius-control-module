import express from 'express';
import { AddressInfo } from 'net';
import { Server } from 'http';
import { createLoginRateLimit, loginRateLimitKey } from '../middlewares/LoginRateLimit';
import { parseLoginHeader } from '../utils/parseLoginHeader';

/** App mínimo: limitador + login falso (senha "certa" → 200; outra → 401). */
const buildApp = () => {
  const app = express();
  app.post('/authenticate', createLoginRateLimit(), (req, res) => {
    const cred = parseLoginHeader(req.headers.authorization);
    if (cred?.password === 'certa') return res.status(200).json({ status: 200, message: 'ok' });
    return res.status(401).json({ status: 401, message: 'Usuário ou senha inválidos.' });
  });
  return app;
};

describe('createLoginRateLimit', () => {
  let server: Server;
  let base: string;

  beforeEach(async () => {
    server = buildApp().listen(0);
    await new Promise<void>(r => server.once('listening', () => r()));
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });
  afterEach(async () => { await new Promise(r => server.close(r)); });

  const login = (password: string, user: string) =>
    fetch(`${base}/authenticate`, { method: 'POST', headers: { Authorization: btoa(`${password};${user}`) } });

  it('3 falhas seguidas → a 4ª recebe 429 no padrão { status, message }', async () => {
    for (let i = 0; i < 3; i++) expect((await login('errada', 'zz_test_a')).status).toBe(401);
    const blocked = await login('certa', 'zz_test_a');
    expect(blocked.status).toBe(429);
    const body = await blocked.json();
    expect(body).toEqual({ status: 429, message: expect.any(String) });
    expect(blocked.headers.get('ratelimit-policy')).not.toBeNull();
    expect(blocked.headers.get('x-ratelimit-limit')).toBeNull();
  });

  it('sucesso não conta', async () => {
    for (let i = 0; i < 5; i++) expect((await login('certa', 'zz_test_b')).status).toBe(200);
    for (let i = 0; i < 2; i++) expect((await login('errada', 'zz_test_b')).status).toBe(401);
    expect((await login('certa', 'zz_test_b')).status).toBe(200);
  });

  it('logins diferentes do mesmo IP não se bloqueiam', async () => {
    for (let i = 0; i < 3; i++) await login('errada', 'zz_test_c');
    expect((await login('errada', 'zz_test_c')).status).toBe(429);
    expect((await login('certa', 'zz_test_d')).status).toBe(200);
  });
});

describe('loginRateLimitKey', () => {
  it('usa IP + login e nunca a senha', () => {
    const req: any = { ip: '10.0.0.1', headers: { authorization: btoa('SenhaSecreta;ZZ_Test_User') } };
    const key = loginRateLimitKey(req);
    expect(key).toBe('10.0.0.1|zz_test_user');
    expect(key).not.toContain('SenhaSecreta');
  });

  it('cabeçalho inválido: chave só com o IP', () => {
    expect(loginRateLimitKey({ ip: '10.0.0.1', headers: {} } as any)).toBe('10.0.0.1|');
  });
});
