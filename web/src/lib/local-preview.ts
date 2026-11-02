/**
 * Dev-only auth bypass for the dashboard. Enabled only when
 * NEXT_PUBLIC_LOCAL_PREVIEW=1 and the API origin is local, so production
 * builds (HTTPS API) never activate it.
 */
const apiOrigin = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export const LOCAL_PREVIEW =
  process.env.NEXT_PUBLIC_LOCAL_PREVIEW === "1" &&
  apiOrigin.startsWith("http://localhost");

export const LOCAL_VIEWER = {
  id: "dev-local",
  name: "Local",
  email: "dev@localhost",
  image: null,
};
