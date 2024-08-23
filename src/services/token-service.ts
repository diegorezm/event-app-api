import { verify, sign } from "hono/jwt";
import { SECRET_KEY } from "../env";
import { HTTPException } from "hono/http-exception";

type TokenPayload = {
  email: string;
  type: "login" | "email_verification" | "password_reset";
  exp?: number;
};

class TokenService {
  private static DEFAULT_EXPIRATION = 60 * 60;
  async sign(payload: TokenPayload) {
    if (!payload.exp) {
      payload.exp =
        Math.floor(Date.now() / 1000) + TokenService.DEFAULT_EXPIRATION;
    }
    const token = await sign(payload, SECRET_KEY);
    return token;
  }

  async verify(token: string): Promise<TokenPayload> {
    try {
      const decoded = (await verify(token, SECRET_KEY)) as TokenPayload;

      const currentTime = Math.floor(Date.now() / 1000);

      if (decoded.exp && decoded.exp < currentTime) {
        throw new HTTPException(401, { message: "Token expirado." });
      }

      if (!decoded.type || !decoded.email) {
        throw new HTTPException(401, { message: "Token inválido." });
      }

      return decoded;
    } catch (error: any) {
      throw new HTTPException(401, {
        message:
          error.message === undefined
            ? "Falha na verificação do token."
            : error.message,
      });
    }
  }
}

export default new TokenService();
