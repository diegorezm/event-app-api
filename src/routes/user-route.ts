import { Hono } from "hono";
import tokenService from "../services/token-service";
import userService from "../services/user-service";

const app = new Hono().get("/:id", async (c) => {
  const authHeader = c.req.header("Authorization");
  const id = c.req.param("id");
  const token = authHeader ? authHeader.replace("Bearer ", "") : "";
  await tokenService.verify(token);
  userService.getById(id);
});

export default app;
