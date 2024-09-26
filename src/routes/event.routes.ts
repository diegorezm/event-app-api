import { Hono } from "hono";
import db from "../db";
import { EventRepository } from "../repositories/event.repository";
import { EventService } from "../services/event.service";
import { zValidator } from "@hono/zod-validator";
import { paginatedRequestSchema } from "../types";

const eventsRepository = new EventRepository(db);
const eventsService = new EventService(eventsRepository);

const routes = new Hono().basePath("/events");

routes.get("/", zValidator("query", paginatedRequestSchema), async (c) => {
  const paginatedRequest = c.req.valid("query");
  const events = await eventsService.findAll(paginatedRequest);
  return c.json(events);
});

routes.get("/:id", async (c) => {
  const id = c.req.param("id");
  const event = await eventsService.findById(id);
  return c.json(event);
});

export default routes;
