import {ContainerModule, interfaces} from "inversify"
import OtpRepository, {IOtpRepository} from "../../repositories/otp.repository";
import {DI_SYMBOLS} from "../types";
import OtpService, {IOtpService} from "../../services/otp.service";

const initializeModule = (bind: interfaces.Bind) => {
  bind<IOtpRepository>(DI_SYMBOLS.IOtpRepository).to(OtpRepository);
  bind<IOtpService>(DI_SYMBOLS.IOTPService).to(OtpService);
}

export const OtpModule = new ContainerModule(initializeModule)
