import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { EventDTO, Event } from "../models/events";
import { eventsTableSchema } from "../db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { PaginatedRequest, PaginatedResponse } from "../types";
import lower from "../utils/db/lower";

export interface IEventRepository {
  findById(id: string): Promise<Event | null>
  findAll(params: PaginatedRequest): Promise<PaginatedResponse<Event>>
  create(event: EventDTO): Promise<Event>
  update(id: string, event: EventDTO): Promise<Event>
  delete(id: string): Promise<void>
}

export class EventRepository implements IEventRepository {
  constructor(private readonly db: NodePgDatabase) { }

  async findById(id: string): Promise<Event | null> {
    const [event] = await this.db.select().from(eventsTableSchema).where(eq(eventsTableSchema.id, id))
    return event ?? null
  }

  async findAll(params: PaginatedRequest): Promise<PaginatedResponse<Event>> {
    const { page = 1, pageSize = 10, q } = params
    const offset = (page - 1) * pageSize;

    const query = this.db.select().from(eventsTableSchema)

    if (q) {
      query.where(sql`${lower(eventsTableSchema.title)} LIKE ${`%${q.toLowerCase}%`}`)
    }

    const sizeOfTable = await this.db.select({ count: sql<number>`count(*) over()` })
      .from(query.as("filtered"))
      .limit(1)
    const numberOfPages = Math.ceil(sizeOfTable[0].count / pageSize)

    const events = await query
      .limit(pageSize)
      .offset(offset)
      .orderBy(desc(eventsTableSchema.createdAt))

    return {
      data: events,
      total: numberOfPages,
      page,
      pageSize,
    }
  }

  async create(event: EventDTO): Promise<Event> {
    const [newEvent] = await this.db.insert(eventsTableSchema).values(event).returning()
    return newEvent
  }

  async update(id: string, event: EventDTO): Promise<Event> {
    const [updatedEvent] = await this.db.update(eventsTableSchema)
      .set(event)
      .where(eq(eventsTableSchema.id, id))
      .returning()
    return updatedEvent
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(eventsTableSchema).where(eq(eventsTableSchema.id, id))
  }
}