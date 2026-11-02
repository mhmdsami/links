/**
 * Dev-only auth bypass for the dashboard. Enabled only by an explicit local
 * env flag, which is not set in CI or production builds.
 */
export const LOCAL_PREVIEW = process.env.NEXT_PUBLIC_LOCAL_PREVIEW === "1";

export const LOCAL_VIEWER = {
  id: "dev-local",
  name: "Local",
  email: "dev@localhost",
  image: null,
};
