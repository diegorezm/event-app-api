import { sql } from "drizzle-orm";
import {
  varchar,
  date,
  pgTable,
  timestamp,
  uuid,
  pgEnum,
  integer,
  boolean,
  text,
} from "drizzle-orm/pg-core";

export const userRolesEnum = pgEnum("user_roles", [
  "Administrator",
  "Employee",
  "User",
]);

export const userOtpStatusEnum = pgEnum("user_otp_status", [
  "PENDING",
  "EXPIRED",
  "SUCCESS",
]);

export const userOtpOperationEnum = pgEnum("user_otp_operation", [
  "EMAIL_VERIFICATION",
  "PASSWORD_RESET",
]);

export const userTableSchema = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 15 }),
  password: text("password").notNull(),
  profilePicture: text("profilePicture"),
  birthDate: date("birthDate"),
  bio: text("bio"),
  role: userRolesEnum("role").default("User"),
  address: text("address"),
  cep: varchar("cep", { length: 12 }),
  verified: boolean("verified").default(false),
  createdAt: timestamp("created_at", { mode: "date", precision: 3 })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", precision: 3 })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const userOtpSchema = pgTable("user_otp", {
  id: integer("id").generatedByDefaultAsIdentity().primaryKey(),
  userId: uuid("userId")
    .references(() => userTableSchema.id)
    .notNull(),
  otp: varchar("otp", { length: 255 }).notNull().unique(),
  status: userOtpStatusEnum("status").default("PENDING").notNull(),
  operation: userOtpOperationEnum("operation").notNull(),
  createdAt: timestamp("created_at", {
    mode: "date",
    precision: 3,
  })
    .defaultNow()
    .notNull(),
  expiresAt: timestamp("expires_at", { mode: "date", precision: 3 })
    .default(sql`now() + interval '1 hour'`)
    .notNull(),
});

export const eventsTableSchema = pgTable("events", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", {
    length: 255,
  }).notNull(),
  description: text("description"),
  location: text("location").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  totalTickets: integer("total_tickets"),
  createdBy: uuid("user_id")
    .references(() => userTableSchema.id)
    .notNull(),
  createdAt: timestamp("created_at", {
    mode: "date",
    precision: 3,
  })
    .defaultNow()
    .notNull(),
});

export const ticketsTableSchema = pgTable("tickets", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  eventId: uuid("event_id")
    .references(() => eventsTableSchema.id)
    .notNull(),
  buyerId: uuid("buyer_id")
    .references(() => userTableSchema.id)
    .notNull(),
  purchase_time: timestamp("purchase_time").defaultNow().notNull(),
});
