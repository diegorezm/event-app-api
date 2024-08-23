import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import {
  userOtpOperationEnum,
  userOtpSchema,
  userOtpStatusEnum,
} from "../../db/schema";
import { z } from "zod";

const selectSchema = createSelectSchema(userOtpSchema);
export const userOtpInsertSchema = createInsertSchema(userOtpSchema).omit({
  createdAt: true,
  expiresAt: true,
  id: true,
  otp: true,
});

export type UserOtp = z.infer<typeof selectSchema>;
export type UserOtpDTO = z.infer<typeof userOtpInsertSchema>;
export type UserOtpStatus = (typeof userOtpStatusEnum.enumValues)[number];
export type UserOtpOperation = (typeof userOtpOperationEnum.enumValues)[number];
