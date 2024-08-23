import { HTTPException } from "hono/http-exception";
import { User, UserDTO, UserLoginDTO } from "../models/user";
import userService from "./user-service";
import crypto from "../utils/crypto";
import db from "../db";
import { userTableSchema } from "../db/schema";
import { eq } from "drizzle-orm";
import tokenService from "./token-service";

class AuthService {
  async passwordReset(token: string, password: string) {
    const verify = await tokenService.verify(token);
    if (verify.type !== "password_reset") {
      throw new HTTPException(403);
    }
    const user = await userService.getByEmail(verify.email);
    const hash = crypto.encrypt(password);
    await db
      .update(userTableSchema)
      .set({ password: hash })
      .where(eq(userTableSchema.id, user.id));
  }

  async register(payload: UserDTO) {
    const userExists = await userService.getByEmail(payload.email);
    if (userExists) {
      throw new HTTPException(403, { message: "Email já cadastrado." });
    }
    const passwordHash = crypto.encrypt(payload.password);
    if (passwordHash === undefined) {
      throw new HTTPException(500, {
        message: "Não foi possivel criar o usuário.",
      });
    }
    payload.password = passwordHash;
    const [user] = await db.insert(userTableSchema).values(payload).returning();
    return user as User;
  }

  async login(payload: UserLoginDTO) {
    const user = await this.getUserWithPassword(payload.email);

    if (!user) {
      throw new HTTPException(404, { message: "Usuário não existe." });
    }

    const userPassword = crypto.decrypt(user.password);

    if (userPassword === undefined) {
      throw new HTTPException(500, {
        message: "Não foi possivel fazer o login.",
      });
    }

    if (userPassword === payload.password) {
      const token = await tokenService.sign({
        email: user.email,
        type: "login",
      });
      return {
        user: user as User,
        token,
      };
    }
    if (!user) {
      throw new HTTPException(401, { message: "Login não autorizado." });
    }
  }

  private async getUserWithPassword(email: string) {
    const [user] = await db
      .select()
      .from(userTableSchema)
      .where(eq(userTableSchema.email, email));
    return user;
  }
}

export default new AuthService();
