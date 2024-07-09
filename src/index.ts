import { Hono } from "hono";
import links from "./routes/links";
import { link } from "./schema";
import db from "./utils/db";
import { eq } from "drizzle-orm";

const app = new Hono();

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
