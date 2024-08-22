import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { userInsertSchema, userLoginSchema } from "../models/user";
import authService from "../services/auth-service";
import { HTTPException } from "hono/http-exception";
import mailService from "../services/mail-service";

const app = new Hono()
  .get("/verify/mail/:token", async (c) => {
    const token = c.req.param("token");
    const data = await mailService.verifyEmailToken(token);
    return c.json({ message: "Email verificado com sucesso!" });
  })
  .get("/verify/:token", async () => {
    throw new HTTPException(404);
  })
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
