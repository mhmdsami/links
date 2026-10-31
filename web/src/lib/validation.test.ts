import assert from "node:assert/strict";
import { test } from "node:test";
import { createLinkSchema, firstError, updateLinkSchema } from "./validation.ts";

test("accepts a well-formed link", () => {
  const parsed = createLinkSchema.parse({ url: "https://example.com/a?b=1", code: "launch-2026" });
  assert.equal(parsed.code, "launch-2026");
  assert.equal(parsed.url, "https://example.com/a?b=1");
});

test("trims the code and url", () => {
  const parsed = createLinkSchema.parse({ url: "  https://example.com  ", code: "  docs  " });
  assert.equal(parsed.code, "docs");
  assert.equal(parsed.url, "https://example.com");
});

test("rejects a destination that is not a URL", () => {
  const result = createLinkSchema.safeParse({ url: "not a url", code: "docs" });
  assert.equal(result.success, false);
  if (!result.success) assert.match(firstError(result.error), /valid URL/);
});

test("rejects unsafe characters in the code", () => {
  assert.equal(createLinkSchema.safeParse({ url: "https://example.com", code: "a/b" }).success, false);
  assert.equal(createLinkSchema.safeParse({ url: "https://example.com", code: "" }).success, false);
});

test("update schema only requires a url", () => {
  assert.equal(updateLinkSchema.safeParse({ url: "https://example.com" }).success, true);
  assert.equal(updateLinkSchema.safeParse({ url: "" }).success, false);
});
