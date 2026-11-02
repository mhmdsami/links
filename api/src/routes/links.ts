import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { validator } from "hono/validator";
import type { Env } from "../env";
import type { Auth } from "../lib/auth";
import { isLocalPreview } from "../lib/local-preview";
import { insertLinkSchema, link, updateLinkSchema } from "../schema";
import type { Db } from "../utils/db";

const app = new Hono<{
  Bindings: Env;
  Variables: { db: Db; auth: Auth };
}>();

app.use(async (c, next) => {
  if (isLocalPreview(c.env)) {
    return next();
  }

  const session = await c.get("auth").api.getSession({
    headers: c.req.raw.headers,
  });
  if (!session?.user) {
    return c.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  await next();
});

app.get("/all", async (c) => {
  const data = await c.get("db").select().from(link);
  return c.json({
    success: true,
    message: "Fetched all links successfully",
    data,
  });
});

app.get("/:code", async (c) => {
  const code = c.req.param("code");
  const [data] = await c
    .get("db")
    .select()
    .from(link)
    .where(eq(link.code, code));

  if (!data) {
    return c.json(
      { success: false, message: "Link not found" },
      { status: 404 },
    );
  }

  return c.json({ success: true, message: "Link found", data });
});

app.post(
  "/create",
  validator("json", (value, c) => {
    const parsed = insertLinkSchema.safeParse(value);
    if (!parsed.success) {
      return c.json({ success: false, message: parsed.error }, { status: 400 });
    }
    return parsed.data;
  }),
  async (c) => {
    const { code, url } = c.req.valid("json");
    const db = c.get("db");

    const [existing] = await db.select().from(link).where(eq(link.code, code));
    if (existing) {
      return c.json(
        { success: false, message: "Code already exists" },
        { status: 409 },
      );
    }

    const data = await db.insert(link).values({ url, code }).returning();
    return c.json(
      { success: true, message: "Link successfully created", data },
      { status: 201 },
    );
  },
);

app.patch(
  "/:code",
  validator("json", (value, c) => {
    const parsed = updateLinkSchema.safeParse(value);
    if (!parsed.success) {
      return c.json({ success: false, message: parsed.error }, { status: 400 });
    }
    return parsed.data;
  }),
  async (c) => {
    const code = c.req.param("code");
    const db = c.get("db");
    const [data] = await db.select().from(link).where(eq(link.code, code));

    if (!data) {
      return c.json(
        { success: false, message: "Link not found" },
        { status: 404 },
      );
    }

    const { url } = c.req.valid("json");
    const updated = await db
      .update(link)
      .set({ url })
      .where(eq(link.code, code));
    return c.json({ success: true, message: "Link updated", updated });
  },
);

app.delete("/:code", async (c) => {
  const code = c.req.param("code");
  const db = c.get("db");
  const [data] = await db.select().from(link).where(eq(link.code, code));

  if (!data) {
    return c.json(
      { success: false, message: "Link not found" },
      { status: 404 },
    );
  }

  const deleted = await db.delete(link).where(eq(link.code, code));
  return c.json({ success: true, message: "Link deleted", deleted });
});

export default app;
