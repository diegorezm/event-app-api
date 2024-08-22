import { eq } from "drizzle-orm";
import db from "../db";
import { userTableSchema } from "../db/schema";
import { User } from "../models/user";
import { HTTPException } from "hono/http-exception";

class UserService {
  async getByEmail(email: string): Promise<User> {
    try {
      const [user] = await db
        .select()
        .from(userTableSchema)
        .where(eq(userTableSchema.email, email));

      if (!user) {
        throw new HTTPException(404, { message: `Usuário não encontrado` });
      }

      return user;
    } catch (error) {
      const errorMessage = (error as Error).message || 'Unknown error';
      throw new HTTPException(500, { message: `Erro ao encontrar Usuário` });
    }
  }

  async getById(id: string): Promise<User> {
    try {
      const [user] = await db
        .select()
        .from(userTableSchema)
        .where(eq(userTableSchema.id, id));

      if (!user) {
        throw new HTTPException(404, { message: `Usuário não encontrado` });
      }

      return user;
    } catch (error) {
      const errorMessage = (error as Error).message || 'Unknown error';
      throw new HTTPException(500, { message: `Usuário não encontrado` });
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      const user = await this.getById(id);

      if (!user) {
        throw new HTTPException(404, { message: `Usuário não encontrado` });
      }

      await db
        .delete(userTableSchema)
        .where(eq(userTableSchema.id, id));

    } catch (error) {
      const errorMessage = (error as Error).message || 'Unknown error';
      throw new HTTPException(500, { message: `Erro ao deletar usuário` });
    }
  }

  async updateUser(id: string, updatedFields: Partial<User>): Promise<User> {
    try {
      const user = await this.getById(id);

      if (!user) {
        throw new HTTPException(404, { message: `Usuário não encontrado` });
      }

      await db
        .update(userTableSchema)
        .set(updatedFields)
        .where(eq(userTableSchema.id, id));

      const updatedUser = await this.getById(id);
      return updatedUser;

    } catch (error) {
      if (error instanceof Error) {
        throw new HTTPException(500, { message: `Erro ao atualizar Usário` });
      } else {
        throw new HTTPException(500, { message: `Erro ao atualizar Usário` });
      }
    }
  }
}

export default new UserService();
