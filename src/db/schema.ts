import {
  char,
  date,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const userTableSchema = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: char("name", { length: 255 }).notNull(),
  email: char("email", { length: 255 }).notNull(),
  phone: char("phone", { length: 15 }),
  password: text("password").notNull(),
  profilePicture: text("profilePicture"),
  birthDate: date("birthDate"),
  bio: text("bio"),
  address: text("address"),
  cep: char("cep", { length: 12 }),
  createdAt: timestamp("created_at", { mode: "date", precision: 3 })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", precision: 3 })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
