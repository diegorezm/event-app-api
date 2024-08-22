import db from "../db";
import { User } from "../models/user";
import { eq } from "drizzle-orm";
import { userTableSchema } from "../db/schema";
import { HTTPException } from "hono/http-exception";

class UserService {
  async getByEmail(email: string): Promise<User> {
    const [user] = await db
      .select()
      .from(userTableSchema)
      .where(eq(userTableSchema.email, email));

    if (!user) {
      throw new HTTPException(404, { message: `Usuário não encontrado` });
    }

    return user;
  }

  async getById(id: string): Promise<User> {
    const [user] = await db
      .select()
      .from(userTableSchema)
      .where(eq(userTableSchema.id, id));

    if (!user) {
      throw new HTTPException(404, { message: `Usuário não encontrado` });
    }

    return user;
  }

  async delete(id: string): Promise<void> {
    const user = await this.getById(id);

    if (!user) {
      throw new HTTPException(404, { message: `Usuário não encontrado` });
    }

    await db.delete(userTableSchema).where(eq(userTableSchema.id, id));
  }

  async update(id: string, updatedFields: Partial<User>): Promise<User> {
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
  }
}

export default new UserService();
