import {inject, injectable} from "inversify";
import {toUserSafe, User, UserDTO, UserSafe} from "../models/user";
import {IUserRepository} from "../repositories/user.repository";
import {InternalServerError, NotFoundError} from "../types";
import {DI_SYMBOLS} from "../di/types";

export interface IUserService {
  getByEmail(email: string): Promise<UserSafe>;
  getById(id: string): Promise<UserSafe>;
  update(id: string, updatedFields: Partial<User>): Promise<UserSafe>;
  delete(id: string): Promise<void>;
}

@injectable()
class UserService implements IUserService {
  constructor(@inject(DI_SYMBOLS.IUserRepository) private readonly userRepository: IUserRepository) {}

  async getByEmail(email: string): Promise<UserSafe> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundError("Usuário não encontrado");
    }
    return toUserSafe(user);
  }

  async getById(id: string): Promise<UserSafe> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError("Usuário não encontrado");
    }
    return toUserSafe(user);
  }

  async delete(id: string): Promise<void> {
    try {
      await this.userRepository.delete(id);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new InternalServerError(error.message);
      }
      throw new InternalServerError("Não foi possível deletar o usuário");
    }
  }

  async update(id: string, payload: UserDTO): Promise<UserSafe> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError("Usuário não encontrado");
    }
    const updatedUser = await this.userRepository.update(payload, id);
    return toUserSafe(updatedUser);
  }
}

export default UserService;
