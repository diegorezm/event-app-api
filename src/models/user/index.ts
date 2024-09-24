import { createInsertSchema } from "drizzle-zod";
import { userTableSchema } from "../../db/schema";
import { z } from "zod";

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
export type User = typeof userTableSchema.$inferSelect;
export type UserSafe = Omit<User, "password">;
export type UserDTO = z.infer<typeof userInsertSchema>;
export type UserLoginDTO = z.infer<typeof userLoginSchema>;
export type UserUpdateDTO = z.infer<typeof userUpdateSchema>;

export const toUserSafe = (user: User): UserSafe => {
  const safeUser: UserSafe = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    profilePicture: user.profilePicture,
    birthDate: user.birthDate,
    bio: user.bio,
    address: user.address,
    cep: user.cep,
    role: user.role,
    verified: user.verified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
  return safeUser;
};