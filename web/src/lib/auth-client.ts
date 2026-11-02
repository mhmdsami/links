import { createAuthClient } from "better-auth/react";

/**
 * Same-origin better-auth client. The web app and API share
 * links.sam1.space, so cookies need no cross-origin configuration.
 */
export const authClient = createAuthClient();
