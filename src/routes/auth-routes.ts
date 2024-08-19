import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { userInsertSchema, userLoginSchema } from "../models/user";
import authService from "../services/auth-service";

const app = new Hono()
  .post("/login", zValidator("json", userLoginSchema), async (c) => {
    const body = c.req.valid("json");
    const response = await authService.login(body);
    return c.json(response);
  })
  .post("/register", zValidator("json", userInsertSchema), async (c) => {
    const body = c.req.valid("json");
    const response = await authService.register(body);
    return c.json(response);
  });
export default app;
