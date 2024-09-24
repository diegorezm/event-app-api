import { verify, sign } from "hono/jwt";
import { SECRET_KEY } from '../../env'

export type TokenClaims = {
  email: string;
  type: "login" | "email_verification" | "password_reset";
};

class TokenUtils {
  private SECRET_KEY: string;
  private TOKEN_DURATIONS = {
    login: 6 * 60 * 60, // 6 hours in seconds
    email_verification: 15 * 60, // 15 minutes in seconds
    password_reset: 15 * 60, // 15 minutes in seconds
  };

  constructor() {
    this.SECRET_KEY = SECRET_KEY;
  }

  async sign(payload: TokenClaims) {
    const exp = Math.floor(Date.now() / 1000) + this.TOKEN_DURATIONS[payload.type];
    const tokenPayload = { ...payload, exp };
    const token = await sign(tokenPayload, this.SECRET_KEY);
    return token;
  }

  async verify(token: string) {
    const decoded = await verify(token, this.SECRET_KEY);
    return decoded as TokenClaims;
  }
}

export default new TokenUtils();