import { eq } from "drizzle-orm";
import { Hono } from "hono";
import type { Env } from "./env";
import { createAuth, type Auth } from "./lib/auth";
import links from "./routes/links";
import { link } from "./schema";
import { getDb, type Db } from "./utils/db";

type AppEnv = {
  Bindings: Env;
  Variables: { db: Db; auth: Auth };
};

const app = new Hono<AppEnv>();

app.use("*", async (c, next) => {
  const db = getDb(c.env);
  c.set("db", db);

  if (
    c.req.path.startsWith("/api/auth") ||
    c.req.path.startsWith("/api/admin")
  ) {
    c.set("auth", createAuth(c.env, db));
  }

  await next();
});

app.on(["POST", "GET"], "/api/auth/*", (c) => c.get("auth").handler(c.req.raw));

app.get("/api/health", (c) => {
  return c.json({
    success: true,
    message: "links API is healthy",
  });
});

app.route("/api/admin/link", links);

app.get("/api/redirect/:code", async (c) => {
  const code = c.req.param("code");
  const db = c.get("db");
  const [data] = await db.select().from(link).where(eq(link.code, code));

  if (!data) {
    return c.json(
      { success: false, message: "Link not found!" },
      { status: 404 },
    );
  }

  await db
    .update(link)
    .set({
      clicks: data.clicks + 1,
    })
    .where(eq(link.code, code));

  return c.json({ success: true, data: { url: data.url } });
});

app.notFound((c) => {
  return c.json({ success: false, message: "Route not found!" }, { status: 404 });
});

export default app;
