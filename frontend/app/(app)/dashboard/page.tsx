"use client";

import * as React from "react";
import {
  Copy,
  MoreVertical,
  Pencil,
  Trash2,
  Plus,
  Link as LinkIcon,
  RotateCcw,
} from "lucide-react";
import {
  FaInstagram,
  FaTiktok,
  FaLinkedin,
  FaYoutube,
  FaGithub,
  FaXTwitter,
} from "react-icons/fa6";
import type { IconType } from "react-icons";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

import { EditProfileDialog } from "@/components/dialogs/EditProfileDialog";
import { AddSocialDialog } from "@/components/dialogs/AddSocialDialog";
import { EditSocialDialog } from "@/components/dialogs/EditSocialDialog";
import { AddLinkDialog } from "@/components/dialogs/AddlinkDialog";
import { EditLinkDialog } from "@/components/dialogs/EditLinkDialog";
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";

import { getMe, type User } from "@/services/user.services";
import {
  getLinks as fetchLinksSvc,
  type LinkItem as LinkItemSvc,
  updateLink as updateLinkSvc,
  deleteLink as deleteLinkSvc,
} from "@/services/link.services";
import {
  getSocials,
  upsertSocial,
  restoreSocial,
  type SocialLink,
  SoftDeleteSocial,
  HardDeleteSocial,
} from "@/services/social.services";
import { toPublicUrl } from "@/lib/image-url";

type SocialItem = {
  id: string;
  key: string;
  label: string;
  icon: IconType;
  url?: string;
  is_active: boolean;
};

type Profile = { name: string; bio: string; avatarUrl: string; handle: string };
type LinkItem = { id: string; title: string; url: string };

const ICONS: Record<
  "instagram" | "tiktok" | "x" | "linkedin" | "youtube" | "github",
  { label: string; icon: IconType }
> = {
  instagram: { label: "Instagram", icon: FaInstagram },
  tiktok: { label: "TikTok", icon: FaTiktok },
  x: { label: "X (Twitter)", icon: FaXTwitter },
  linkedin: { label: "LinkedIn", icon: FaLinkedin },
  youtube: { label: "YouTube", icon: FaYoutube },
  github: { label: "GitHub", icon: FaGithub },
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("") || "U";

const toProfile = (u: User | null | undefined): Profile => ({
  name: (u?.name?.trim() || u?.username?.trim() || "User").slice(0, 80),
  bio: (u?.bio ?? "") || "",
  avatarUrl: toPublicUrl((u as any)?.avatar_url ?? (u as any)?.avatar ?? ""),
  handle: u?.username || "username",
});

const getDomain = (url: string) => {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

function extractUsername(platform: string, url?: string): string | undefined {
  if (!url) return undefined;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    const path = u.pathname.replace(/\/+$/g, "");
    if (platform === "instagram" && /instagram\.com$/.test(host)) {
      const seg = path.split("/").filter(Boolean)[0];
      return seg || undefined;
    }
    if (platform === "tiktok" && /tiktok\.com$/.test(host)) {
      const seg = path.split("/").filter(Boolean)[0];
      return seg?.startsWith("@") ? seg.slice(1) : seg || undefined;
    }
    if (platform === "x" && /(x\.com|twitter\.com)$/.test(host)) {
      const seg = path.split("/").filter(Boolean)[0];
      return seg || undefined;
    }
    if (platform === "linkedin" && /linkedin\.com$/.test(host)) {
      const segs = path.split("/").filter(Boolean);
      const idx = segs.indexOf("in");
      if (idx >= 0 && segs[idx + 1]) return segs[idx + 1];
      return undefined;
    }
    if (platform === "youtube" && /youtube\.com$/.test(host)) {
      const seg = path.split("/").filter(Boolean)[0];
      if (seg?.startsWith("@")) return seg.slice(1);
      return undefined;
    }
    if (platform === "github" && /github\.com$/.test(host)) {
      const seg = path.split("/").filter(Boolean)[0];
      return seg || undefined;
    }
    return undefined;
  } catch {
    return undefined;
  }
}

function mapSocialRecords(recs?: SocialLink[]): SocialItem[] {
  return (recs ?? []).map((r) => {
    const meta = ICONS[r.platform as keyof typeof ICONS] || ICONS.linkedin;
    return {
      id: r.id,
      key: r.platform,
      label: meta.label,
      icon: meta.icon,
      url: r.url,
      is_active: Boolean(r.is_active),
    };
  });
}

export default function DashboardPage() {
  const [loading, setLoading] = React.useState(true);
  const [profile, setProfile] = React.useState<Profile>({
    name: "Loading…",
    bio: "",
    avatarUrl: "/avatar-placeholder.jpg",
    handle: "…",
  });
  const [socials, setSocials] = React.useState<SocialItem[]>([]);
  const [links, setLinks] = React.useState<LinkItem[]>([]);
  const [openAddLink, setOpenAddLink] = React.useState(false);
  const [openAddSocial, setOpenAddSocial] = React.useState(false);
  const [openEdit, setOpenEdit] = React.useState(false);
  const [openEditLink, setOpenEditLink] = React.useState(false);
  const [editing, setEditing] = React.useState<LinkItem | null>(null);
  const [openConfirmDelete, setOpenConfirmDelete] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [targetDelete, setTargetDelete] = React.useState<LinkItem | null>(null);
  const [openEditSocial, setOpenEditSocial] = React.useState(false);
  const [selectedSocial, setSelectedSocial] = React.useState<{
    id: string | null;
    platform: string | null;
    username?: string | null;
  }>({ id: null, platform: null, username: null });
  const [openSocialPopover, setOpenSocialPopover] = React.useState<
    string | null
  >(null);

  const refetchLinks = React.useCallback(async () => {
    const { items } = await fetchLinksSvc({ page: 1, limit: 10 });
    const mapped: LinkItem[] = (items as LinkItemSvc[]).map((l) => ({
      id: l.id,
      title: l.title,
      url: l.url,
    }));
    setLinks(mapped);
  }, []);

  const refetchSocials = React.useCallback(async () => {
    const resp = await getSocials({ sort: "order", order: "asc" });
    const list = Array.isArray(resp?.data) ? resp.data : [];
    setSocials(mapSocialRecords(list as SocialLink[]));
  }, []);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const user = await getMe();
        if (!mounted) return;
        setProfile(toProfile(user));
        await Promise.all([refetchLinks(), refetchSocials()]);
        if (!mounted) return;
      } catch (e: any) {
        if (!mounted) return;
        const status = e?.response?.status;
        if (status === 401) toast.error("Not authenticated");
        else toast.error(e?.message || "Failed to load data");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [refetchLinks, refetchSocials]);

  const avatarSrc = React.useMemo(
    () => toPublicUrl(profile.avatarUrl) || "/avatar-placeholder.jpg",
    [profile.avatarUrl]
  );

  const onEditLink = (item: LinkItem) => {
    setEditing(item);
    setOpenEditLink(true);
  };

  const onSaveEditedLink = async (values: { title: string; url: string }) => {
    if (!editing) return;
    const prev = links;
    setLinks((p) =>
      p.map((l) => (l.id === editing.id ? { ...l, ...values } : l))
    );
    try {
      await updateLinkSvc(editing.id, values);
      await refetchLinks();
      toast.success("Link updated");
    } catch (e: any) {
      setLinks(prev);
      toast.error(e?.message ?? "Failed to update link");
      return;
    } finally {
      setOpenEditLink(false);
      setEditing(null);
    }
  };

  const askDelete = (item: LinkItem) => {
    setTargetDelete(item);
    setOpenConfirmDelete(true);
  };

  const confirmDelete = async () => {
    if (!targetDelete) return;
    const prev = links;
    setDeleting(true);
    setLinks((p) => p.filter((l) => l.id !== targetDelete.id));
    try {
      await deleteLinkSvc(targetDelete.id);
      await refetchLinks();
      toast.success("Link deleted");
      setOpenConfirmDelete(false);
      setTargetDelete(null);
    } catch (e: any) {
      setLinks(prev);
      toast.error(e?.message ?? "Failed to delete link");
    } finally {
      setDeleting(false);
    }
  };

  const onRestoreSocial = async (s: SocialItem) => {
    setSocials((prev) =>
      prev.map((x) => (x.id === s.id ? { ...x, is_active: true } : x))
    );

    try {
      await restoreSocial(s.id);
      await refetchSocials();
      toast.success("Social restored");
    } catch (e: any) {
      setSocials((prev) =>
        prev.map((x) => (x.id === s.id ? { ...x, is_active: false } : x))
      );
      toast.error(e?.message ?? "Failed to restore");
    } finally {
      setOpenSocialPopover(null);
    }
  };

  const onDeleteSocial = async (s: SocialItem) => {
    try {
      await HardDeleteSocial(s.id);
      await refetchSocials();
      toast.success("Social deleted");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to delete");
    } finally {
      setOpenSocialPopover(null);
    }
  };

  return (
    <main className="h-full bg-background text-foreground">
      <div className="mx-auto h-full w-full max-w-7xl px-6 sm:px-10 lg:px-16 py-6">
        <div className="grid h-full grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-background/20 p-6 md:p-8 backdrop-blur-xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-5">
                <Avatar className="h-20 w-20 aspect-square shrink-0 mx-auto rounded-full overflow-hidden ring-2 ring-zinc-800 bg-zinc-800">
                  <AvatarImage
                    src={avatarSrc}
                    alt={profile.name}
                    className="h-full w-fulπl object-cover"
                    style={{ objectFit: "cover" }}
                  />
                  <AvatarFallback className="text-sm">
                    {getInitials(profile.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0">
                  <h1 className="text-xl font-semibold leading-none">
                    {profile.name}
                  </h1>
                  <p className="mt-2 text-[15px] text-muted-foreground leading-relaxed">
                    {profile.bio || "Add a short bio so people know you."}
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    {socials.map((s, idx) =>
                      s.is_active ? (
                        <button
                          key={`${s.key}-${idx}`}
                          type="button"
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full ring-1 ring-border/50 bg-background/50 backdrop-blur transition cursor-pointer hover:bg-accent/50"
                          aria-label={`Edit ${s.label}`}
                          title={`Edit ${s.label}`}
                          onClick={() => {
                            const platform = s.key;
                            const username = extractUsername(platform, s.url);
                            setSelectedSocial({
                              id: s.id,
                              platform,
                              username: username ?? null,
                            });
                            setOpenEditSocial(true);
                          }}
                        >
                          <s.icon className="h-[18px] w-[18px] opacity-90" />
                        </button>
                      ) : (
                        <Popover
                          key={`${s.key}-${idx}`}
                          open={openSocialPopover === s.id}
                          onOpenChange={(v) =>
                            setOpenSocialPopover(v ? s.id : null)
                          }
                        >
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              className="inline-flex h-10 w-10 items-center justify-center rounded-full ring-1 ring-border/50 bg-background/50 backdrop-blur transition cursor-pointer hover:bg-accent/50 opacity-40 grayscale"
                              aria-label={`${s.label} actions`}
                              title={`${s.label} actions`}
                            >
                              <s.icon className="h-[18px] w-[18px] opacity-90" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent
                            align="center"
                            side="bottom"
                            sideOffset={6}
                            className="w-40 p-2"
                          >
                            <div className="grid gap-1.5">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="justify-start gap-2"
                                onClick={() => onRestoreSocial(s)}
                              >
                                <RotateCcw className="h-4 w-4" />
                                Restore
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="justify-start gap-2 text-destructive hover:text-destructive"
                                onClick={() => onDeleteSocial(s)}
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </Button>
                            </div>
                          </PopoverContent>
                        </Popover>
                      )
                    )}
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 rounded-full cursor-pointer"
                      onClick={() => setOpenAddSocial(true)}
                      title="Add social"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="shrink-0">
                <Button
                  className="h-9 rounded-full px-4 cursor-pointer"
                  onClick={() => setOpenEdit(true)}
                >
                  Edit Profile
                </Button>
              </div>
            </div>

            <Separator className="mb-4 opacity-60" />

            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Your Links</p>
              <Button
                className="h-8 bg-primary rounded-full px-3 cursor-pointer"
                onClick={() => setOpenAddLink(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Link
              </Button>
            </div>

            {loading ? (
              <EditorSkeleton />
            ) : links.length > 0 ? (
              <ul className="space-y-3">
                {links.map((l) => (
                  <li
                    key={l.id}
                    className="group flex items-center justify-between rounded-2xl bg-background/40 px-4 py-3 border border-border/60 supports-[backdrop-filter]:bg-background/30 supports-[backdrop-filter]:backdrop-blur"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{l.title}</p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {getDomain(l.url)}
                      </p>
                    </div>

                    <div className="ml-3 flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full cursor-pointer"
                        onClick={() => {
                          navigator.clipboard.writeText(l.url);
                          toast.success("Link copied");
                        }}
                        title="Copy link URL"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full cursor-pointer"
                            title="More actions"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem
                            onClick={() => onEditLink(l)}
                            className="gap-2 cursor-pointer"
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => askDelete(l)}
                            className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="grid place-items-center py-10 text-center">
                <div className="grid text-6xl h-16 w-16 place-items-center rounded-full bg-background/40 ring-1 ring-border/50">
                  <LinkIcon />
                </div>
                <p className="mt-6 text-lg font-medium">
                  Show the world who you are.
                </p>
                <p className="text-sm text-muted-foreground">
                  Add a link to get started.
                </p>
                <Button
                  variant="outline"
                  className="mt-4 rounded-full px-5 cursor-pointer"
                  onClick={() => setOpenAddLink(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add your first link
                </Button>
              </div>
            )}

            <AddLinkDialog
              open={openAddLink}
              onOpenChange={setOpenAddLink}
              onCreated={async () => {
                await refetchLinks();
                toast.success("Link added");
              }}
            />

            <AddSocialDialog
              open={openAddSocial}
              onOpenChange={setOpenAddSocial}
              onSave={async ({ platform, username }) => {
                const resp = await upsertSocial({ platform, username });
                await refetchSocials();
                toast.success(resp?.message ?? "Social saved");
              }}
            />

            <EditSocialDialog
              open={openEditSocial}
              onOpenChange={(v) => {
                setOpenEditSocial(v);
                if (!v)
                  setSelectedSocial({
                    id: null,
                    platform: null,
                    username: null,
                  });
              }}
              platform={(selectedSocial.platform as any) ?? null}
              initialUsername={selectedSocial.username ?? ""}
              onSave={async ({ platform, username }) => {
                const resp = await upsertSocial({ platform, username });
                await refetchSocials();
                toast.success(resp?.message ?? "Social updated");
              }}
              onDelete={async () => {
                if (!selectedSocial.id) return;
                await SoftDeleteSocial(selectedSocial.id);
                await refetchSocials();
                toast.success("Social deactivated");
              }}
            />

            <EditProfileDialog
              open={openEdit}
              onOpenChange={setOpenEdit}
              initial={{
                avatarUrl: toPublicUrl(profile.avatarUrl) || "",
                name: profile.name,
                bio: profile.bio,
              }}
              onSuccess={(user) => {
                setProfile((p) => ({
                  ...p,
                  name: user.name ?? p.name,
                  bio: user.bio ?? p.bio,
                  avatarUrl:
                    toPublicUrl(
                      (user as any).avatar_url ?? (user as any).avatar
                    ) || p.avatarUrl,
                }));
                toast.success("Profile updated");
              }}
            />
          </section>

          <aside className="hidden lg:block">
            <div className="sticky top-[88px]">
              <PhonePreview profile={profile} socials={socials} links={links} />
            </div>
          </aside>
        </div>
      </div>

      <EditLinkDialog
        open={openEditLink}
        onOpenChange={(v) => {
          setOpenEditLink(v);
          if (!v) setEditing(null);
        }}
        id={editing?.id ?? null}
        initial={
          editing
            ? { title: editing.title, url: editing.url }
            : { title: "", url: "" }
        }
        onSuccess={async () => {
          await refetchLinks();
        }}
      />

      <ConfirmDialog
        open={openConfirmDelete}
        onOpenChange={(v) => {
          setOpenConfirmDelete(v);
          if (!v) setTargetDelete(null);
        }}
        title="Delete link?"
        description={
          targetDelete ? `This will remove "${targetDelete.title}".` : undefined
        }
        confirmText="Delete"
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </main>
  );
}

function EditorSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex items-start gap-5">
        <div className="h-20 w-20 rounded-full bg-muted/50" />
        <div className="flex-1 space-y-3">
          <div className="h-5 w-56 rounded bg-muted/50" />
          <div className="h-4 w-full max-w-[480px] rounded bg-muted/50" />
          <div className="mt-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted/50" />
            <div className="h-10 w-10 rounded-full bg-muted/50" />
            <div className="h-10 w-10 rounded-full bg-muted/50" />
            <div className="h-10 w-10 rounded-full bg-muted/50" />
          </div>
        </div>
      </div>
      <Separator className="my-8 opacity-60" />
      <div className="h-8 w-40 rounded-full bg-muted/50" />
      <div className="mt-4 space-y-3">
        <div className="h-14 rounded-2xl bg-muted/50" />
        <div className="h-14 rounded-2xl bg-muted/50" />
      </div>
    </div>
  );
}

function PhonePreview({
  profile,
  socials,
  links,
}: {
  profile: Profile;
  socials: SocialItem[];
  links: LinkItem[];
}) {
  const phoneAvatar =
    toPublicUrl(profile.avatarUrl) || "/avatar-placeholder.jpg";
  const activeSocials = socials.filter((s) => s.is_active);

  return (
    <div className="relative mx-auto h-[560px] w-[330px] overflow-hidden rounded-[28px] bg-black text-white ring-1 ring-zinc-800">
      <div className="h-full overflow-y-auto px-5 pt-10 pb-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex flex-col items-center">
          <Avatar className="h-16 w-16 ring-2 ring-zinc-700 bg-zinc-800">
            <AvatarImage
              className="object-cover"
              src={phoneAvatar}
              alt={profile.name}
            />
            <AvatarFallback className="text-xs">
              {getInitials(profile.name)}
            </AvatarFallback>
          </Avatar>
          <h3 className="mt-3 text-[15px] font-semibold leading-none">
            {profile.name}
          </h3>
          <p className="mt-2 max-w-[260px] text-center text-[11px] leading-relaxed text-zinc-300">
            {profile.bio || "Add a short bio so people know you."}
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-zinc-200">
            {activeSocials.map((s, idx) => (
              <span
                key={`${s.key}-${idx}`}
                className="inline-grid h-7 w-7 place-items-center rounded-full ring-1 bg-white/5 ring-white/10"
                title={s.label}
              >
                <s.icon className="h-3.5 w-3.5 opacity-90" />
              </span>
            ))}
          </div>
        </div>

        <div className="mt-5 h-px w-full bg-white/10" />

        <ul className="mt-5 grid gap-2.5">
          {links.map((l) => (
            <li key={l.id}>
              <a
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                title={l.url}
                className="block rounded-2xl bg-white/[0.06] px-4 py-3 ring-1 ring-white/10 transition hover:bg-white/[0.1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 cursor-pointer"
                style={{ minHeight: 44 }}
              >
                <p className="truncate text-sm font-medium text-white leading-none">
                  {l.title}
                </p>
                <p className="mt-1 truncate text-[11px] leading-normal text-zinc-300">
                  {getDomain(l.url)}
                </p>
              </a>
            </li>
          ))}
        </ul>

        <div className="h-4" />
      </div>
    </div>
  );
}
