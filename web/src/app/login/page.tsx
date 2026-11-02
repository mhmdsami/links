import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { getSession } from "@/lib/auth-server";
import { LOCAL_PREVIEW } from "@/lib/local-preview";
import { GoogleSignIn } from "./google-signin";

export default async function LoginPage() {
  if (LOCAL_PREVIEW) {
    redirect("/");
  }

  const cookie = (await cookies()).toString();
  const session = await getSession(cookie);

  if (session?.user) {
    redirect("/");
  }

  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-md border border-border bg-card p-6">
        <Logo />
        <h1 className="mt-5 text-lg font-semibold">Sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">Continue with Google to manage your links.</p>
        <div className="mt-6">
          <GoogleSignIn />
        </div>
      </div>
    </main>
  );
}
