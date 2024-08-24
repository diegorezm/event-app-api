import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { userInsertSchema, userLoginSchema } from "../models/user";
import authService from "../services/auth-service";
import tokenService from "../services/token-service";
import userService from "../services/user-service";
import { z } from "zod";
import mail from "../utils/mail";

const app = new Hono()
  .get("/verify/:token", async (c) => {
    const token = c.req.param("token");
    const verify = await tokenService.verify(token);
    const user = await userService.getByEmail(verify.email);
    return c.json({ user });
  })
  .post(
    "/verify/otp/password-reset",
    zValidator(
      "json",
      z.object({
        otp: z.string(),
        email: z.string().email(),
        newPassword: z.string(),
      }),
    ),
    async (c) => {
      const { otp, email, newPassword } = c.req.valid("json");
      const data = await mail.passwordResetOtp(newPassword, email, otp);
      return c.json(data);
    },
  )
  .post(
    "/verify/otp/email-verification",
    zValidator(
      "json",
      z.object({
        otp: z.string(),
        email: z.string().email(),
      }),
    ),
    async (c) => {
      const { otp, email } = c.req.valid("json");
      const data = await mail.emailVerificationOtp(email, otp);
      return c.json(data);
    },
  )
  .post(
    "/password-reset",
    zValidator(
      "json",
      z.object({
        email: z.string().email(),
      }),
    ),
    async (c) => {
      const { email } = c.req.valid("json");
      await mail.sendPasswordResetEmail(email);
      return c.json({ message: "Email enviado!" }, 200);
    },
  )
  .post(
    "/email-verification",
    zValidator(
      "json",
      z.object({
        email: z.string().email(),
      }),
    ),
    async (c) => {
      const { email } = c.req.valid("json");
      await mail.sendVerificationEmail(email);
      return c.json({ message: "Email enviado!" }, 200);
    },
  )
  .post("/verify/email-verification/:token", async (c) => {
    const token = c.req.param("token");
    await authService.verifyEmail(token);
    return c.status(200);
  })
  .post(
    "/verify/password-reset/:token",
    zValidator(
      "json",
      z.object({
        password: z.string(),
      }),
    ),
    async (c) => {
      const token = c.req.param("token");
      const { password } = c.req.valid("json");
      await authService.passwordReset(token, password);
      return c.status(200);
    },
  )
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
