import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { userInsertSchema, userLoginSchema } from "../models/user";
import authService from "../services/auth-service";
import { HTTPException } from "hono/http-exception";
import mail from "../utils/mail";
import tokenService from "../services/token-service";
import userService from "../services/user-service";

const app = new Hono()
 
  .get("/:id", async (c) => {
    const authHeader = c.req.header('Authorization');
    const id = c.req.param("id");
    const token = authHeader ? authHeader.replace('Bearer ', '') : '';
    await tokenService.verify(token);
    userService.getById(id);

  })
 
export default app;
