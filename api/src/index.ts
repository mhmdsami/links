import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "./lib/auth";
import links from "./routes/links";
import { link } from "./schema";
import db from "./utils/db";
import { eq } from "drizzle-orm";

const app = new Hono();

const allowedOrigins = (Bun.env.TRUSTED_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  "*",
  cors({
    origin: (origin) => (allowedOrigins.includes(origin) ? origin : (allowedOrigins[0] ?? "")),
    credentials: true,
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.get("/", (c) => {
  return c.json({
    success: true,
    message: "links API is healthy",
    uptime: process.uptime(),
  });
});

app.route("/admin/link", links);

app.get("/:code", async (c) => {
  const code = c.req.param("code");
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

  return c.redirect(data.url);
});

app.notFound((c) => {
  return c.json(
    { success: false, message: "Route not found!" },
    { status: 404 },
  );
});

export default app;
