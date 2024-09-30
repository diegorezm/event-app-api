import {ContainerModule, interfaces} from "inversify";
import {AuthService, IAuthService} from "../../services/auth.service";
import {DI_SYMBOLS} from "../types";
import {AuthMailerService, IAuthMailerService} from "../../services/auth-mailer.service";

const initializeModule = (bind: interfaces.Bind) => {
  bind<IAuthService>(DI_SYMBOLS.IAuthService).to(AuthService);
  bind<IAuthMailerService>(DI_SYMBOLS.IAuthMailerService).to(AuthMailerService);
}

export const AuthModule = new ContainerModule(initializeModule)
