import {ContainerModule, interfaces} from "inversify";
import {EventRepository, IEventRepository} from "../../repositories/event.repository";
import {DI_SYMBOLS} from "../types";
import {EventService, IEventService} from "../../services/event.service";

const initializeModule = (bind: interfaces.Bind) => {
  bind<IEventRepository>(DI_SYMBOLS.IEventRepository).to(EventRepository);
  bind<IEventService>(DI_SYMBOLS.IEventService).to(EventService);
}

export const EventModule = new ContainerModule(initializeModule)
