import { serve } from "@hono/node-server";
import { DrizzleError } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { ZodError } from "zod";
import { NODE_ENV } from "./env";

const app = new Hono();

app.use(logger());

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

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

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
