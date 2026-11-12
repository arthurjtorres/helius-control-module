import { Request } from "express";
import { ipKeyGenerator, rateLimit } from "express-rate-limit";
import Response from "../utils/Response";
import { loginFromHeader } from "../utils/parseLoginHeader";

/** Janela de contagem das falhas de login. */
export const LOGIN_WINDOW_MS = 15 * 60 * 1000;
/** Falhas permitidas por IP + login dentro da janela; a seguinte recebe 429. */
export const LOGIN_MAX_FAILURES = 3;

/**
 * Chave do limite: IP + login (o login sai do cabeçalho `Authorization`).
 * A senha nunca é usada nem registrada. Login normalizado em minúsculas para que
 * variações de caixa não multipliquem as tentativas.
 */
export const loginRateLimitKey = (req: Request): string => {
  const ip = ipKeyGenerator(req.ip ?? "");
  const login = (loginFromHeader(req.headers["authorization"]) ?? "").trim().toLowerCase();
  return `${ip}|${login}`;
};

/**
 * Cria o limitador do `POST /authenticate`: conta só respostas com falha
 * (`skipSuccessfulRequests`) e responde 429 no padrão `{ status, message }`.
 * Fábrica (e não instância única) para que cada teste tenha sua própria contagem.
 */
export const createLoginRateLimit = () =>
  rateLimit({
    windowMs: LOGIN_WINDOW_MS,
    limit: LOGIN_MAX_FAILURES,
    skipSuccessfulRequests: true,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    keyGenerator: (req) => loginRateLimitKey(req),
    handler: (_req, res) => {
      const resp = Response.tooManyRequests();
      res.status(resp.status).json(resp);
    },
  });

export default createLoginRateLimit;
