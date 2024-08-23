import db from "../db";
import { User } from "../models/user";
import { eq } from "drizzle-orm";
import { userTableSchema } from "../db/schema";
import { HTTPException } from "hono/http-exception";

class UserService {
  async getByEmail(email: string): Promise<User> {
    try {
      const [user] = await db
        .select()
        .from(userTableSchema)
        .where(eq(userTableSchema.email, email));
      return user;
    } catch (error) {
      throw new HTTPException(500, {
        message: "Não foi possivel recuperar este registro.",
      });
    }
  }

  async getById(id: string): Promise<User> {
    try {
      const [user] = await db
        .select()
        .from(userTableSchema)
        .where(eq(userTableSchema.id, id));
      return user;
    } catch (error) {
      throw new HTTPException(500, {
        message: "Não foi possivel recuperar este registro.",
      });
    }
  }

  async delete(id: string): Promise<void> {
    const user = await this.getById(id);

    if (!user) {
      throw new HTTPException(404, { message: `Usuário não encontrado` });
    }
    try {
      await db.delete(userTableSchema).where(eq(userTableSchema.id, id));
    } catch (error) {
      throw new HTTPException(500, {
        message: "Não foi possivel deletar este registro.",
      });
    }
  }

  async update(id: string, updatedFields: Partial<User>): Promise<User> {
    const user = await this.getById(id);

    if (!user) {
      throw new HTTPException(404, { message: `Usuário não encontrado` });
    }

    try {
      await db
        .update(userTableSchema)
        .set(updatedFields)
        .where(eq(userTableSchema.id, id));

      const updatedUser = await this.getById(id);
      return updatedUser;
    } catch (error) {
      throw new HTTPException(500, {
        message: "Não foi possível atualizar este registro.",
      });
    }
  }
}

export default new UserService();
