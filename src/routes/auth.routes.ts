import { Hono } from "hono";
import db from "../db";
import UserRepository from "../repositories/user.repository";
import { AuthService } from "../services/auth.service";
import UserService from "../services/user.service";
import { AuthMailerService } from "../services/auth-mailer.service";
import OtpService from "../services/otp.service";
import OtpRepository from "../repositories/otp.repository";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { userInsertSchema, userLoginSchema } from "../models/user";

// TODO: create a controller in the future
const userRepository = new UserRepository(db)
const otpRepository = new OtpRepository(db)

const authService = new AuthService(userRepository)
const userService = new UserService(userRepository)
const otpService = new OtpService(otpRepository, userRepository)
const authMailerService = new AuthMailerService(otpService, userService)

const router = new Hono()

const authMailRoutes = new Hono()

authMailRoutes.post("/send-email-verification", zValidator("json", z.object({
  email: z.string().email()
})), async (c) => {
  const { email } = c.req.valid("json")
  await authMailerService.sendEmailVerification(email)
  return c.json({ message: "Email enviado com sucesso!" }, 200)
})

authMailRoutes.post("/send-password-reset-email", zValidator("json", z.object({
  email: z.string().email()
})), async (c) => {
  const { email } = c.req.valid("json")
  await authMailerService.sendPasswordResetEmail(email)
  return c.json({ message: "Email enviado com sucesso!" }, 200)
})

authMailRoutes.post("/verify/reset-password", zValidator("json", z.object({
  otp: z.string(),
  email: z.string().email(),
  newPassword: z.string()
})), async (c) => {
  const { otp, email, newPassword } = c.req.valid("json")
  await authMailerService.resetPassword(otp, email, newPassword)
  return c.json({ message: "Senha atualizada com sucesso!" }, 200)
})

authMailRoutes.post("/verify/email", zValidator("json", z.object({
  otp: z.string(),
  email: z.string().email()
})), async (c) => {
  const { otp, email } = c.req.valid("json")
  await authMailerService.verifyEmail(otp, email)
  return c.json({ message: "Email verificado com sucesso!" }, 200)
})

router.mount("/email-verify", authMailRoutes.fetch)

router.post("/login", zValidator("json", userLoginSchema), async (c) => {
  const loginSchema = c.req.valid("json")
  const user = await authService.login(loginSchema)
  return c.json(user, 200)
})

router.post("/register", zValidator("json", userInsertSchema), async (c) => {
  const userSchema = c.req.valid("json")
  const user = await authService.register(userSchema)
  return c.json(user, 201)
})

export default router
