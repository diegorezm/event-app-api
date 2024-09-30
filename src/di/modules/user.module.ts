import {ContainerModule, interfaces} from "inversify";
import UserRepository, {IUserRepository} from "../../repositories/user.repository";
import UserService, {IUserService} from "../../services/user.service";
import {DI_SYMBOLS} from "../types";

const initializeModule = (bind: interfaces.Bind) => {
  bind<IUserRepository>(DI_SYMBOLS.IUserRepository).to(UserRepository);
  bind<IUserService>(DI_SYMBOLS.IUserService).to(UserService);
}

export const UserModule = new ContainerModule(initializeModule)
