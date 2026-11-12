import { loginFromHeader, parseLoginHeader } from '../utils/parseLoginHeader';

const header = (raw: string) => btoa(raw);

describe('parseLoginHeader', () => {
  it('senha simples', () => {
    expect(parseLoginHeader(header('Senha@123;zz_test_user'))).toEqual({ password: 'Senha@123', login: 'zz_test_user' });
  });

  it('senha com ; no meio', () => {
    expect(parseLoginHeader(header('abc;def;zz_test_user'))).toEqual({ password: 'abc;def', login: 'zz_test_user' });
  });

  it('senha com ; no fim', () => {
    expect(parseLoginHeader(header('abc;;zz_test_user'))).toEqual({ password: 'abc;', login: 'zz_test_user' });
  });

  it('cabeçalho sem ; → null', () => {
    expect(parseLoginHeader(header('semseparador'))).toBeNull();
  });

  it('login ou senha vazios → null', () => {
    expect(parseLoginHeader(header(';zz_test_user'))).toBeNull();
    expect(parseLoginHeader(header('senha;'))).toBeNull();
  });

  it('ausente ou Base64 inválido → null', () => {
    expect(parseLoginHeader(undefined)).toBeNull();
    expect(parseLoginHeader('')).toBeNull();
    expect(parseLoginHeader('###')).toBeNull();
  });
});

describe('loginFromHeader', () => {
  it('devolve só o login', () => {
    expect(loginFromHeader(header('a;b;zz_test_user'))).toBe('zz_test_user');
    expect(loginFromHeader(undefined)).toBeNull();
  });
});
