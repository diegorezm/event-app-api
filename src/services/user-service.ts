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
        throw new HTTPException(404, { message: `User with email ${email} not found.` });
      }

      return user;
    } catch (error) {
      throw new HTTPException(500, { message: `Failed to fetch user by email: ${email}. ${error.message}` });
    }
  }

  async getById(id: string): Promise<User> {
    try {
      const [user] = await db
        .select()
        .from(userTableSchema)
        .where(eq(userTableSchema.id, id));

      if (!user) {
        throw new HTTPException(404, { message: `User with ID ${id} not found.` });
      }

      return user;
    } catch (error) {
      throw new HTTPException(500, { message: `Failed to fetch user by ID: ${id}. ${error.message}` });
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      const user = await this.getById(id);

      if (!user) {
        throw new HTTPException(404, { message: `User with ID ${id} not found.` });
      }

      await db
        .delete(userTableSchema)
        .where(eq(userTableSchema.id, id));

    } catch (error) {
      throw new HTTPException(500, { message: `Failed to delete user with ID: ${id}. ${error.message}` });
    }
  }
}

export default new UserService();
