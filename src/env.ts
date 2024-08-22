import "dotenv/config";
import { z } from "zod";
const envSchema = z.object({
  NODE_ENV: z.string().default("dev"),
  DB_URL: z.string().url(),
  SECRET_KEY: z.string(),
  CRYPTO_KEY: z.string(),
  MAIL_HOST: z.string(),
  MAIL_PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val), {
      message: "MAIL_PORT must be a valid number",
    }),
  MAIL_USER: z.string().email(),
  MAIL_PASS: z.string(),
  API_URL: z.string().url(),
});

const env = envSchema.safeParse(process.env);

if (!env.success) {
  console.error("❌ Invalid environment variables:", env.error.format());
  throw new Error("Invalid environment variables");
}

export const {
  NODE_ENV,
  DB_URL,
  SECRET_KEY,
  CRYPTO_KEY,
  MAIL_HOST,
  MAIL_PORT,
  MAIL_USER,
  MAIL_PASS,
  API_URL,
} = env.data;
