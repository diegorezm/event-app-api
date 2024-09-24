import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { PORT } from "./env";

import authRoutes from "./routes/auth.routes";

const app = new Hono();

app.use(logger());

app.route("/auth", authRoutes)

const server = serve({
  fetch: app.fetch,
  port: PORT,
});

server.on("listening", () => {
  const addr = server.address();
  if (typeof addr === "object" && addr !== null) {
    console.log(`Server running on: ${addr.address}:${addr.port}`);
  } else {
    console.error("Address not found.");
  }
});
