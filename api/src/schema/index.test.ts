import { describe, expect, test } from "bun:test";
import { insertLinkSchema, updateLinkSchema } from "./index";

describe("insertLinkSchema", () => {
  test("accepts a code and an absolute url", () => {
    const parsed = insertLinkSchema.parse({ code: "docs", url: "https://example.com/docs" });
    expect(parsed.code).toBe("docs");
    expect(parsed.url).toBe("https://example.com/docs");
  });

  test("rejects a relative url", () => {
    expect(insertLinkSchema.safeParse({ code: "docs", url: "/docs" }).success).toBe(false);
  });

  test("requires a code", () => {
    expect(insertLinkSchema.safeParse({ url: "https://example.com" }).success).toBe(false);
  });
});

describe("updateLinkSchema", () => {
  test("only requires a url", () => {
    expect(updateLinkSchema.safeParse({ url: "https://example.com" }).success).toBe(true);
    expect(updateLinkSchema.safeParse({}).success).toBe(false);
  });
});
