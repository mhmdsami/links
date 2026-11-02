import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer } from "better-auth/plugins";
import * as schema from "../schema/auth";
import db from "../utils/db";

/**
 * Base better-auth setup for the links API.
 *
 * NOTE: the canonical copy of this file lives on the server (with the
 * migrated `user` / `session` / `account` / `verification` tables). This
 * local mirror exists so the wiring patch in `docs/auth-wiring.patch` and
 * `bun run types` work against the public repo. Keep it in sync if the
 * server copy changes.
 */
export const auth = betterAuth({
  baseURL: Bun.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  secret: Bun.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, { provider: "sqlite", schema }),
  socialProviders: {
    google: {
      clientId: Bun.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: Bun.env.GOOGLE_CLIENT_SECRET ?? "",
      scope: ["openid", "email", "profile"],
    },
  },
  trustedOrigins: (Bun.env.TRUSTED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  plugins: [
    // Deep-link handoff for the Expo app (links://) and bearer-token sessions
    // for native clients that cannot use host-only cookies.
    expo(),
    bearer(),
  ],
});
