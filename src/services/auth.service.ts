import { toUserSafe, UserDTO, UserLoginDTO, UserSafe } from "../models/user";
import { HTTPException } from "hono/http-exception";
import crypto from "../utils/crypto";

import { IUserRepository } from "../repositories/user.repository";
import { ConflictError, InternalServerError, NotFoundError, UnauthorizedError } from "../types";
import TokenUtils from "../utils/token";

type IAuthService = {
  passwordReset: (token: string, password: string) => Promise<void>;
  register: (payload: UserDTO) => Promise<UserSafe>;
  login: (payload: UserLoginDTO) => Promise<{ user: UserSafe; token: string }>;
};

export class AuthService implements IAuthService {
  private readonly tokenUtils: typeof TokenUtils;
  constructor(private readonly userRepository: IUserRepository) {
    this.tokenUtils = TokenUtils;
  }


  async register(payload: UserDTO): Promise<UserSafe> {
    const userExists = await this.userRepository.findByEmail(payload.email);
    if (userExists) {
      throw new ConflictError("Email já cadastrado.");
    }
    const passwordHash = crypto.encrypt(payload.password);
    if (passwordHash === undefined) {
      throw new InternalServerError("Não foi possivel criar o usuário.");
    }
    payload.password = passwordHash;
    return toUserSafe(await this.userRepository.create(payload));
  }

  async login(payload: UserLoginDTO) {
    const user = await this.userRepository.findByEmail(payload.email);

    if (!user) {
      throw new NotFoundError("Usuário não existe.");
    }

    const userPassword = crypto.decrypt(user.password);

    if (userPassword === undefined) {
      throw new InternalServerError("Não foi possivel fazer o login.");
    }

    if (userPassword !== payload.password) {
      throw new UnauthorizedError("Login não autorizado.");
    }

    const token = await this.tokenUtils.sign({
      email: user.email,
      type: "login",
    });
    return {
      user: toUserSafe(user),
      token,
    };
  }

  async passwordReset(token: string, password: string) {
    const verify = await this.tokenUtils.verify(token);
    if (verify.type !== "password_reset") {
      throw new HTTPException(403);
    }
    const user = await this.userRepository.findByEmail(verify.email);
    if (!user) {
      throw new NotFoundError("Usuário não encontrado");
    }
    const hash = crypto.encrypt(password);
    await this.userRepository.update({ password: hash }, user.id);
  }
}