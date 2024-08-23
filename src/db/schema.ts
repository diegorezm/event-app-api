import {
  varchar,
  date,
  pgTable,
  text,
  timestamp,
  uuid,
  pgEnum,
} from "drizzle-orm/pg-core";
export const RoleEnum = pgEnum("role", ["Administrator", "Employee", "User"]);
export const userTableSchema = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 15 }),
  password: text("password").notNull(),
  profilePicture: text("profilePicture"),
  birthDate: date("birthDate"),
  bio: text("bio"),
  role: RoleEnum("admin").default("User"),
  address: text("address"),
  cep: varchar("cep", { length: 12 }),
  emailVerifiedAt: timestamp("email_verified_at", {
    mode: "date",
    precision: 3,
  }),
  createdAt: timestamp("created_at", { mode: "date", precision: 3 })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", precision: 3 })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
