import { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import tokenUtils from "../utils/token";

export const authMiddleware = async (c: Context, next: Next) => {
  const headerToken = c.req.header("Authorization") || "";
  if (headerToken === "") {
    throw new HTTPException(401, {
      message: "Authorization header is missing.",
    });
  }
  try {
    const jwt = headerToken.split(" ")[1];
    if (!jwt) {
      throw new HTTPException(401, { message: "JWT token is missing." });
    }
    const tokenData = await tokenUtils.verify(jwt);

    if (!tokenData) {
      throw new HTTPException(401, { message: "Invalid token." });
    }
    c.set("jwtPayload", tokenData);
  } catch (e: unknown) {
    if (e instanceof HTTPException) {
      throw e;
    }
    throw new HTTPException(500, {
      message: "Internal server error.",
      cause: e,
    });
  }
  await next();
};
