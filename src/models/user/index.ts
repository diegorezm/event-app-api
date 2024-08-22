import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { userTableSchema } from "../../db/schema";
import { z } from "zod";

// get user schema from the table
const userSelectSchema = createSelectSchema(userTableSchema).omit({
  password: true,
});

export const userInsertSchema = createInsertSchema(userTableSchema).omit({
  createdAt: true,
  updatedAt: true,
});

export const userLoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const userUpdateSchema = createInsertSchema(userTableSchema)
  .omit({
    createdAt: true,
    updatedAt: true,
  })
  .partial();

// export user schema as User type
export type User = z.infer<typeof userSelectSchema>;
export type UserDTO = z.infer<typeof userInsertSchema>;
export type UserLoginDTO = z.infer<typeof userLoginSchema>;
export type UserUpdateDTO = z.infer<typeof userUpdateSchema>;
