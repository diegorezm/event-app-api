import { Client } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { DB_URL } from "../../src/env";

const client = new Client({
  connectionString: DB_URL,
});

async function connectDB() {
  try {
    await client.connect();
    console.log("Connected to PostgreSQL database");
  } catch (err: any) {
    console.error("Error connecting to PostgreSQL database:", err.message);
    throw err;
  }
}
connectDB();
const db = drizzle(client);

export default db;
