"use client";

import {
  AlertCircle,
  Check,
  Copy,
  ExternalLink,
  Link2,
  Loader2,
  MousePointerClick,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import { SignOutButton } from "@/components/sign-out-button";
import { ApiError, linksApi, shortUrl } from "@/lib/api";
import { formatCount, formatDate } from "@/lib/format";
import type { SessionUser, Link } from "@/lib/types";
import { createLinkSchema, firstError, updateLinkSchema } from "@/lib/validation";
import { cn } from "@/lib/utils";

type FieldErrors = { url?: string; code?: string };

export function Dashboard({ user }: { user: SessionUser }) {
  const router = useRouter();
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [url, setUrl] = useState("");
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const [copied, setCopied] = useState<string | null>(null);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [editUrl, setEditUrl] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingCode, setDeletingCode] = useState<string | null>(null);
  const [confirmingCode, setConfirmingCode] = useState<string | null>(null);
  const [busyCode, setBusyCode] = useState<string | null>(null);

  const handleUnauthorized = useCallback(
    (error: unknown) => {
      if (error instanceof ApiError && error.status === 401) {
        router.replace("/login");
        router.refresh();
        return true;
      }
      return false;
    },
    [router]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setLinks(await linksApi.list());
    } catch (error) {
      if (handleUnauthorized(error)) return;
      setLoadError(error instanceof Error ? error.message : "Could not load links.");
    } finally {
      setLoading(false);
    }
  }, [handleUnauthorized]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const parsed = createLinkSchema.safeParse({ url, code });
    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if ((key === "url" || key === "code") && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setCreating(true);
    try {
      const created = await linksApi.create(parsed.data);
      if (created) {
        setLinks((current) => [created, ...current.filter((link) => link.code !== created.code)]);
      } else {
        await load();
      }
      setUrl("");
      setCode("");
    } catch (error) {
      if (handleUnauthorized(error)) return;
      if (error instanceof ApiError && error.status === 409) {
        setErrors({ code: "That code is already taken. Pick another one." });
      } else {
        setFormError(error instanceof Error ? error.message : "Could not create the link.");
      }
    } finally {
      setCreating(false);
    }
  }

  async function copy(linkCode: string) {
    try {
      await navigator.clipboard.writeText(shortUrl(linkCode));
      setCopied(linkCode);
      window.setTimeout(() => setCopied((current) => (current === linkCode ? null : current)), 1600);
    } catch {
      setFormError("Clipboard access was denied. Copy the short link from the row instead.");
    }
  }

  function startEdit(link: Link) {
    setEditingCode(link.code);
    setEditUrl(link.url);
    setEditError(null);
    setConfirmingCode(null);
  }

  async function saveEdit(linkCode: string) {
    setEditError(null);
    const parsed = updateLinkSchema.safeParse({ url: editUrl });
    if (!parsed.success) {
      setEditError(firstError(parsed.error));
      return;
    }

    setSaving(true);
    setBusyCode(linkCode);
    try {
      await linksApi.update(linkCode, parsed.data.url);
      setLinks((current) => current.map((link) => (link.code === linkCode ? { ...link, url: parsed.data.url } : link)));
      setEditingCode(null);
    } catch (error) {
      if (handleUnauthorized(error)) return;
      setEditError(error instanceof Error ? error.message : "Could not update the link.");
    } finally {
      setSaving(false);
      setBusyCode(null);
    }
  }

  async function remove(linkCode: string) {
    setDeletingCode(linkCode);
    setBusyCode(linkCode);
    try {
      await linksApi.remove(linkCode);
      setLinks((current) => current.filter((link) => link.code !== linkCode));
      setConfirmingCode(null);
    } catch (error) {
      if (handleUnauthorized(error)) return;
      setFormError(error instanceof Error ? error.message : "Could not delete the link.");
    } finally {
      setDeletingCode(null);
      setBusyCode(null);
    }
  }

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-border bg-background">
        <div className="mx-auto flex h-14 w-full max-w-4xl items-center justify-between gap-4 px-4">
          <Logo />
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex min-w-0 items-center gap-2">
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.image}
                  alt=""
                  width={28}
                  height={28}
                  referrerPolicy="no-referrer"
                  className="size-7 rounded-full border border-border object-cover"
                />
              ) : (
                <span className="flex size-7 items-center justify-center rounded-full border border-border bg-accent text-[11px] font-semibold uppercase">
                  {user.email.slice(0, 1)}
                </span>
              )}
              <span className="hidden max-w-[220px] truncate text-[13px] text-muted-foreground sm:inline">{user.email}</span>
            </div>
            <SignOutButton compact />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-bold">Links</h1>

        <Card className="mb-6 mt-5">
          <form onSubmit={onCreate} className="grid gap-3 p-4 md:grid-cols-[minmax(0,1fr)_160px_auto] md:items-end">
            <div className="space-y-2">
              <Label htmlFor="destination">Destination URL</Label>
              <Input
                id="destination"
                inputMode="url"
                placeholder="https://example.com/some/long/path"
                value={url}
                onChange={(event) => {
                  setUrl(event.target.value);
                  setErrors((current) => ({ ...current, url: undefined }));
                }}
                aria-invalid={Boolean(errors.url)}
                aria-describedby={errors.url ? "destination-error" : undefined}
                autoComplete="url"
              />
              {errors.url && (
                <p id="destination-error" className="text-[12px] text-destructive">
                  {errors.url}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="short-code">Short code</Label>
              <Input
                id="short-code"
                placeholder="launch"
                value={code}
                onChange={(event) => {
                  setCode(event.target.value);
                  setErrors((current) => ({ ...current, code: undefined }));
                }}
                aria-invalid={Boolean(errors.code)}
                aria-describedby={errors.code ? "short-code-error" : undefined}
                autoComplete="off"
                spellCheck={false}
                className="font-mono"
              />
              {errors.code && (
                <p id="short-code-error" className="text-[12px] text-destructive">
                  {errors.code}
                </p>
              )}
            </div>

            <Button type="submit" disabled={creating} className="md:mb-[1px]">
              {creating ? <Loader2 className="animate-spin" aria-hidden /> : null}
              Create
            </Button>
          </form>

          {formError && (
            <div
              role="alert"
              className="mx-4 mb-4 flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-[13px] text-destructive"
            >
              <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              <span>{formError}</span>
            </div>
          )}
        </Card>

        {loading ? (
          <div className="flex items-center justify-center rounded-md border border-dashed border-border py-12 text-sm text-muted-foreground">
            <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
            Loading links…
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center gap-4 rounded-md border border-destructive/40 bg-destructive/5 px-6 py-12 text-center">
            <AlertCircle className="size-5 text-destructive" aria-hidden />
            <div>
              <p className="text-sm font-medium">Could not load links</p>
              <p className="mt-1 max-w-md text-[13px] text-muted-foreground">{loadError}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => void load()}>
              Retry
            </Button>
          </div>
        ) : links.length === 0 ? (
          <div className="rounded-md border border-border bg-card px-6 py-10 text-center">
            <Link2 className="mx-auto size-5 text-muted-foreground" aria-hidden />
            <p className="mt-3 text-sm font-medium">No links yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Create one above.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-md border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground">
                    <th scope="col" className="px-4 py-2.5 font-medium">Code</th>
                    <th scope="col" className="px-4 py-2.5 font-medium">Destination</th>
                    <th scope="col" className="px-4 py-2.5 font-medium text-right">Clicks</th>
                    <th scope="col" className="px-4 py-2.5 font-medium">Created</th>
                    <th scope="col" className="px-4 py-2.5 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {links.map((link) => {
                    const isEditing = editingCode === link.code;
                    const isBusy = busyCode === link.code;

                    return (
                      <tr key={link.id} className="border-b border-border last:border-b-0">
                        <td className="px-4 py-3 align-top">
                          <span className="font-mono text-[13px] text-foreground">/{link.code}</span>
                        </td>
                        <td className="max-w-[340px] px-4 py-3 align-top">
                          {isEditing ? (
                            <div className="space-y-1.5">
                              <Input
                                value={editUrl}
                                onChange={(event) => {
                                  setEditUrl(event.target.value);
                                  setEditError(null);
                                }}
                                onKeyDown={(event) => {
                                  if (event.key === "Enter") void saveEdit(link.code);
                                  if (event.key === "Escape") setEditingCode(null);
                                }}
                                autoFocus
                                aria-label={`Destination for ${link.code}`}
                              />
                              {editError && <p className="text-[12px] text-destructive">{editError}</p>}
                            </div>
                          ) : (
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noreferrer noopener"
                              className="group inline-flex max-w-full items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
                              title={link.url}
                            >
                              <span className="truncate">{link.url}</span>
                              <ExternalLink className="size-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-70" aria-hidden />
                            </a>
                          )}
                        </td>
                        <td className="px-4 py-3 align-top text-right">
                          <span className="inline-flex items-center gap-1 font-mono text-[13px] tabular-nums text-foreground/85">
                            <MousePointerClick className="size-3 text-muted-foreground" aria-hidden />
                            {formatCount(link.clicks ?? 0)}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 align-top text-[12.5px] text-muted-foreground">
                          {formatDate(link.createdAt)}
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="flex items-center justify-end gap-1">
                            {isEditing ? (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => void saveEdit(link.code)}
                                  disabled={saving || isBusy}
                                  aria-label={`Save ${link.code}`}
                                >
                                  {saving && isBusy ? <Loader2 className="animate-spin" aria-hidden /> : <Check aria-hidden />}
                                  Save
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="size-8 rounded-lg border border-border bg-[#010409]"
                                  onClick={() => setEditingCode(null)}
                                  disabled={saving}
                                  aria-label="Cancel edit"
                                >
                                  <X aria-hidden />
                                </Button>
                              </>
                            ) : confirmingCode === link.code ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => void remove(link.code)}
                                  disabled={deletingCode === link.code}
                                >
                                  {deletingCode === link.code ? (
                                    <Loader2 className="animate-spin" aria-hidden />
                                  ) : (
                                    <Trash2 aria-hidden />
                                  )}
                                  Delete
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="size-8 rounded-lg border border-border bg-[#010409]"
                                  onClick={() => setConfirmingCode(null)}
                                  disabled={deletingCode === link.code}
                                  aria-label="Cancel delete"
                                >
                                  <X aria-hidden />
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => void copy(link.code)}
                                  aria-label={copied === link.code ? "Copied" : `Copy short link for ${link.code}`}
                                  title="Copy short link"
                                  className={cn("size-8 rounded-lg border border-border bg-[#010409]", copied === link.code && "text-emerald-400")}
                                >
                                  {copied === link.code ? <Check aria-hidden /> : <Copy aria-hidden />}
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="size-8 rounded-lg border border-border bg-[#010409]"
                                  onClick={() => startEdit(link)}
                                  aria-label={`Edit ${link.code}`}
                                  title="Edit destination"
                                >
                                  <Pencil aria-hidden />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => {
                                    setConfirmingCode(link.code);
                                    setEditingCode(null);
                                  }}
                                  aria-label={`Delete ${link.code}`}
                                  title="Delete link"
                                  className="size-8 rounded-lg border border-border bg-[#010409] hover:text-destructive"
                                >
                                  <Trash2 aria-hidden />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
