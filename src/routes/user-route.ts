import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth-middleware";
import { TokenPayload } from "../services/token-service";
import userService from "../services/user-service";

const app = new Hono().get("/whoami", authMiddleware, async (c) => {
  const tokenData = c.get("jwtPayload") as TokenPayload;
  const user = await userService.getByEmail(tokenData.email);
  return c.json(user);
});

export default app;
