import {Hono} from "hono";
import {zValidator} from "@hono/zod-validator";
import {paginatedRequestSchema} from "../types";
import {getInjection} from "../di/container";

const eventsService = getInjection("IEventService");
const routes = new Hono();

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
