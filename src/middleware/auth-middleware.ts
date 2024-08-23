import { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import tokenService from "../services/token-service";

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
    const tokenData = await tokenService.verify(jwt);

    if (!tokenData) {
      throw new HTTPException(401, { message: "Invalid token." });
    }
    c.set("jwtPayload", tokenData);
  } catch (e: any) {
    throw new HTTPException(e.statusCode ?? 500, {
      message: e.message ?? "Internal server error.",
      cause: e,
    });
  }
  await next();
};
