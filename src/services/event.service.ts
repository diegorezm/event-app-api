import {inject, injectable} from "inversify";
import {EventDTO, Event} from "../models/events";
import {IEventRepository} from "../repositories/event.repository";
import {NotFoundError, PaginatedRequest, PaginatedResponse} from "../types";
import {DI_SYMBOLS} from "../di/types";

export interface IEventService {
  findAll(params: PaginatedRequest): Promise<PaginatedResponse<Event>>;
  findById(id: string): Promise<Event>;
  create(event: EventDTO): Promise<Event>;
  update(id: string, event: EventDTO): Promise<Event>;
  delete(id: string): Promise<void>;
}

@injectable()
export class EventService implements IEventService {
  constructor(@inject(DI_SYMBOLS.IEventRepository) private readonly eventRepository: IEventRepository) {}
  async findAll(params: PaginatedRequest): Promise<PaginatedResponse<Event>> {
    const events = await this.eventRepository.findAll(params);
    return events;
  }
  async findById(id: string): Promise<Event> {
    const event = await this.eventRepository.findById(id);
    if (!event) {
      throw new NotFoundError("Evento não encontrado");
    }
    return event;
  }
  async create(event: EventDTO): Promise<Event> {
    const eventCreated = await this.eventRepository.create(event);
    return eventCreated;
  }
  async update(id: string, event: EventDTO): Promise<Event> {
    const eventUpdated = await this.eventRepository.update(id, event);
    return eventUpdated;
  }
  async delete(id: string): Promise<void> {
    return this.eventRepository.delete(id);
  }
}
