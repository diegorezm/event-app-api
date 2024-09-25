import { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import tokenUtils, { TokenClaims } from "../utils/token";
import { UnauthorizedError } from "../types";

const getTokenFromHeader = async (c: Context) => {
  const headerToken = c.req.header("Authorization") || "";
  if (headerToken === "") {
    throw new UnauthorizedError("Authorization header is missing.");
  }
  return headerToken.split(" ")[1];
};

export const authMiddleware = async (c: Context, next: Next) => {
  try {
    const token = await getTokenFromHeader(c);
    const jwt = await tokenUtils.verify(token);
    c.set("jwtPayload", jwt);
    await next();
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new UnauthorizedError("Invalid or expired token.");
  }
};

export const adminMiddleware = async (c: Context, next: Next) => {
  const jwtPayload = c.get("jwtPayload") as TokenClaims;

  if (!jwtPayload || !jwtPayload.isAdmin) {
    throw new UnauthorizedError("You are not authorized to access this resource.");
  }
  await next();
};
