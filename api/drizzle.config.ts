import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: ["./src/schema/index.ts", "./src/schema/auth.ts"],
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "./links.db",
  },
});
