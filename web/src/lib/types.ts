export type Link = {
  id: number;
  code: string;
  url: string;
  clicks: number;
  createdAt: string;
  updatedAt: string;
};

export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data?: T;
};

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
};

export type SessionPayload = {
  user: SessionUser;
  session: { id: string; expiresAt: string };
} | null;
