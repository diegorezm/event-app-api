import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { userTableSchema } from "../../db/schema";
import { z } from "zod";

const userSelectSchema = createSelectSchema(userTableSchema).omit({
  password: true,
});

export const userInsertSchema = createInsertSchema(userTableSchema, {
  name: z.string({ required_error: "Nome é obrigatório" }),
  email: z
    .string({ required_error: "E-mail é obrigatório" })
    .email("E-mail inválido"),
  password: z
    .string({ required_error: "Senha é obrigatória" })
    .min(8, { message: "Senha tem que ter no minímo 8 caracteres" }),
})
  .omit({
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    confirmPassword: z.string({
      required_error: "Por favor confirme sua senha",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Senhas não conhecidem",
    path: ["confirmPassword"],
  });

export const userLoginSchema = z.object({
  email: z.string().email("E-mail inválido"),
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
