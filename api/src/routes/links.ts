import { Hono } from "hono";
import { validator } from "hono/validator";
import { insertLinkSchema, link, updateLinkSchema } from "../schema";
import db from "../utils/db";
import { eq } from "drizzle-orm";

const app = new Hono();

app.use(async (c, next) => {
  const token = c.req.header("Authorization")?.split(" ")[1];
  if (token !== Bun.env.ADMIN_TOKEN) {
    return c.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  await next();
});

app.get("/all", async (c) => {
  const data = await db.select().from(link);
  return c.json({
    success: true,
    message: "Fetched all links successfully",
    data,
  });
});

app.get("/:code", async (c) => {
  const code = c.req.param("code");
  const [data] = await db.select().from(link).where(eq(link.code, code));

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
