import {eq, inArray} from "drizzle-orm";
import {userTableSchema} from "../db/schema";
import {User, UserDTO} from "../models/user";
import {NodePgDatabase} from "drizzle-orm/node-postgres";
import {inject, injectable} from "inversify";
import {DI_SYMBOLS} from "../di/types";


export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(user: UserDTO): Promise<User>;
  update(user: Omit<Partial<User>, "id">, id: string): Promise<User>;
  delete(id: string): Promise<void>;
  bulkDelete(ids: string[]): Promise<void>;
}

@injectable()
export default class UserRepository implements IUserRepository {
  constructor(@inject(DI_SYMBOLS.NodePgDatabase) private readonly db: NodePgDatabase) {}
  async findByEmail(email: string): Promise<User | null> {
    const [user] = await this.db.select().from(userTableSchema).where(eq(userTableSchema.email, email));
    return user;
  }
  async findById(id: string): Promise<User | null> {
    const [user] = await this.db.select().from(userTableSchema).where(eq(userTableSchema.id, id));
    return user;
  }
  async create(user: UserDTO): Promise<User> {
    const [newUser] = await this.db.insert(userTableSchema).values(user).returning();
    return newUser;
  }
  async update(user: Omit<Partial<User>, "id">, id: string): Promise<User> {
    const [updatedUser] = await this.db.update(userTableSchema).set(user).where(eq(userTableSchema.id, id)).returning();
    return updatedUser;
  }
  async delete(id: string): Promise<void> {
    await this.db.delete(userTableSchema).where(eq(userTableSchema.id, id));
  }
  async bulkDelete(ids: string[]): Promise<void> {
    await this.db.delete(userTableSchema).where(inArray(userTableSchema.id, ids));
  }

}

