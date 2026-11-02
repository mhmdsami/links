import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import { LOCAL_PREVIEW, LOCAL_VIEWER } from "@/lib/local-preview";
import { Dashboard } from "./dashboard";

export default async function HomePage() {
  if (LOCAL_PREVIEW) {
    return <Dashboard user={LOCAL_VIEWER} />;
  }

  const cookie = (await cookies()).toString();
  const session = await getSession(cookie);

  if (!session?.user) {
    redirect("/login");
  }

  return <Dashboard user={session.user} />;
}
