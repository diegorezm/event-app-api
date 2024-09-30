import "reflect-metadata";
import {serve} from "@hono/node-server";
import {Hono} from "hono";
import {logger} from "hono/logger";
import {PORT} from "./env";
import authRoutes from "./routes/auth.routes";
import {HTTPException} from "hono/http-exception";
import eventRoutes from "./routes/event.routes";

const app = new Hono();

app.use(logger());


app.route("/auth", authRoutes)
app.route("/events", eventRoutes)

app.onError((error, c) => {
  console.error(error)
  if (error instanceof HTTPException) {
    return c.json({message: error.message}, error.status)
  }
  return c.json({message: "Erro interno do servidor"}, 500)
})

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
