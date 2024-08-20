// TODO: test this middleware
import { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import { verify } from "hono/jwt";
import { SECRET_KEY } from "../env";

export const authMiddleware = async (c: Context, next: Next) => {
  const headerToken = c.req.header("Authorization") || "";
  if (headerToken === "") {
    throw new HTTPException(401);
  }
  try {
    const jwt = headerToken.split(" ")[1];
    if (!jwt) {
      throw new HTTPException(401);
    }
    const tokenData = await verify(jwt, SECRET_KEY);

    if (!tokenData) {
      throw new HTTPException(401);
    }
    c.set("tokenPayload", tokenData);
  } catch (e: any) {
    throw new HTTPException(e.statusCode || 500, {
      message: e.message,
      cause: e,
    });
  }
  await next();
};
