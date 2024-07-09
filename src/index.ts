import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => {
  return c.json({
    success: true,
    message: "links API is healthy",
    uptime: process.uptime(),
  });
});

export default app;
