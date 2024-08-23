import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { userInsertSchema, userLoginSchema } from "../models/user";
import authService from "../services/auth-service";
import { HTTPException } from "hono/http-exception";
import mail from "../utils/mail";
import tokenService from "../services/token-service";
import userService from "../services/user-service";

const app = new Hono()
  .get("/verify/mail/:token", async (c) => {
    const token = c.req.param("token");
    const data = await mail.verifyEmailToken(token);
    if (!data) {
      throw new HTTPException(401);
    }
    return c.json({ message: "Email verificado com sucesso!" });
  })
  .get("/verify/:token", async (c) => {
    const token = c.req.param("token");
    const verify = await tokenService.verify(token);
    const user = await userService.getByEmail(verify.email);
    return c.json({ user });
  })
  .post("/login", zValidator("json", userLoginSchema), async (c) => {
    const body = c.req.valid("json");
    const response = await authService.login(body);
    return c.json(response);
  })
  .post("/register", zValidator("json", userInsertSchema), async (c) => {
    const body = c.req.valid("json");
    console.log("body: ", body);
    const response = await authService.register(body);
    return c.json(response);
  });
export default app;
