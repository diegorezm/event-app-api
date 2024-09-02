import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth-middleware";
import { TokenPayload } from "../services/token-service";
import userService from "../services/user-service";
import { zValidator } from "@hono/zod-validator";
import { User, userUpdateSchema } from "../models/user";

const app = new Hono()
  .get("/whoami", authMiddleware, async (c) => {
    const tokenData = c.get("jwtPayload") as TokenPayload;
    if (tokenData === undefined) {
      return c.json(
        {
          message: "Token inválido.",
        },
        401,
      );
    }

    const user = await userService.getByEmail(tokenData.email);
    return c.json(user);
  })
  .post("/delete/:id", authMiddleware, async (c) => {
    const id = c.req.param("id");
    const tokenData = c.get("jwtPayload") as TokenPayload;
    if (tokenData === undefined) {
      return c.json(
        {
          message: "Token inválido.",
        },
        401,
      );
    }
    userService.delete(id);
  })
  .post(
    "/update/:id",
    authMiddleware,
    zValidator("json", userUpdateSchema),
    async (c) => {
      const id = c.req.param("id");
      const tokenData = c.get("jwtPayload") as TokenPayload;
      if (tokenData === undefined) {
        return c.json(
          {
            message: "Token inválido.",
          },
          401,
        );
      }
      const updatedFields = (await c.req.json()) as Partial<User>;
      userService.update(id, updatedFields);
    },
  );

export default app;
