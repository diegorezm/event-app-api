import { serve } from "@hono/node-server";
import { DrizzleError } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { ZodError } from "zod";
import { PORT, NODE_ENV } from "./env";
import authRoutes from "./routes/auth-routes";
import userRoute from "./routes/user-route";

const app = new Hono();

app.use(logger());

app.route("/auth", authRoutes);
app.route("/users", userRoute);

app.onError((err, c) => {
  if (NODE_ENV === "dev") {
    console.log(err);
  }
  if (err instanceof HTTPException) {
    return c.json(
      {
        message: err.message,
      },
      err.status,
    );
  }
  if (err instanceof ZodError) {
    return c.json(
      {
        message: "Invalid request.",
        errors: err.issues,
      },
      400,
    );
  }
  if (err instanceof DrizzleError) {
    return c.json(
      {
        message: err.message,
      },
      500,
    );
  }
  if (err instanceof Error) {
    return c.json(
      {
        messsage: err.message,
      },
      500,
    );
  }
  return c.json(
    {
      message: "Erro inesperado.",
    },
    500,
  );
});

const server = serve({
  fetch: app.fetch,
  port: PORT,
});

server.on("listening", () => {
  const addr = server.address();

  // Check if addr is an object and contains the expected properties
  if (typeof addr === "object" && addr !== null) {
    console.log(`Server running on: ${addr.address}:${addr.port}`);
  } else {
    console.error("Address not found.");
  }
});
