/** Credenciais extraídas do cabeçalho `Authorization` do login. */
export type LoginCredentials = { login: string; password: string };

/**
 * Lê o cabeçalho `Authorization` do `POST /authenticate`: Base64 de `senha;login`.
 *
 * Separa no **último** `;` (o login não tem `;`; a senha pode ter). Retorna `null`
 * quando o cabeçalho falta, não é Base64 válido, não tem `;` ou tem login/senha vazios.
 */
export const parseLoginHeader = (header: string | undefined): LoginCredentials | null => {
  if (!header) return null;

  let decoded: string;
  try {
    decoded = atob(header);
  } catch {
    return null;
  }

  const sep = decoded.lastIndexOf(";");
  if (sep === -1) return null;

  const password = decoded.slice(0, sep);
  const login = decoded.slice(sep + 1);
  if (!login || !password) return null;

  return { login, password };
};

/** Só o login do cabeçalho (para chave de rate limit); nunca expõe a senha. */
export const loginFromHeader = (header: string | undefined): string | null =>
  parseLoginHeader(header)?.login ?? null;

export default parseLoginHeader;
