import {Container} from "inversify";
import {DI_RETURN_TYPES, DI_SYMBOLS} from "./types";
import {AuthModule} from "./modules/auth.module";
import {EventModule} from "./modules/event.module";
import {UserModule} from "./modules/user.module";
import {DatabaseModule} from "./modules/database.module";
import {OtpModule} from "./modules/otp.module";

const ApplicationContainer = new Container({
  defaultScope: "Singleton",
});

export const loadModules = () => {
  ApplicationContainer.load(DatabaseModule);
  ApplicationContainer.load(AuthModule);
  ApplicationContainer.load(UserModule);
  ApplicationContainer.load(EventModule);
  ApplicationContainer.load(OtpModule);
}

export const unloadModules = () => {
  ApplicationContainer.unload(DatabaseModule);
  ApplicationContainer.unload(AuthModule);
  ApplicationContainer.unload(UserModule);
  ApplicationContainer.unload(EventModule);
  ApplicationContainer.unload(OtpModule);
}

loadModules()

export function getInjection<K extends keyof typeof DI_SYMBOLS>(symbol: K): DI_RETURN_TYPES[K] {
  return ApplicationContainer.get(DI_SYMBOLS[symbol]);
}

export {ApplicationContainer}
