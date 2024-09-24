import { createInsertSchema } from "drizzle-zod";
import {
  userOtpOperationEnum,
  userOtpSchema,
  userOtpStatusEnum,
} from "../../db/schema";
import { z } from "zod";

export const userOtpInsertSchema = createInsertSchema(userOtpSchema, {
  status: z.enum(["PENDING", "EXPIRED", "SUCCESS"]).default("PENDING"),
}).omit({
  createdAt: true,
  id: true,
  otp: true,
  expiresAt: true,
});

export type UserOtp = typeof userOtpSchema.$inferSelect;
export type UserOtpDTO = z.infer<typeof userOtpInsertSchema>;
export type UserOtpStatus = (typeof userOtpStatusEnum.enumValues)[number];
export type UserOtpOperation = (typeof userOtpOperationEnum.enumValues)[number];
