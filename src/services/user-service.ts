import { eq } from "drizzle-orm";
import db from "../db";
import { userTableSchema } from "../db/schema";
import { User } from "../models/user";

class UserService {
  async getByEmail(email: string): Promise<User> {
    const [user] = await db
      .select()
      .from(userTableSchema)
      .where(eq(userTableSchema.email, email));
    return user;
  }

  async getById(id: string): Promise<User> {
    const [user] = await db
      .select()
      .from(userTableSchema)
      .where(eq(userTableSchema.id, id));
    return user;
  }
}
export default new UserService();
