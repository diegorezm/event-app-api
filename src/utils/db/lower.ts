import { SQL, sql } from "drizzle-orm";
import { AnyPgColumn } from "drizzle-orm/pg-core";

export default function lower(field: AnyPgColumn): SQL {
  return sql`lower(${field})`;
}
