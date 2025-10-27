"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, Eye, LogOut, Moon, Sun, Pencil } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toPublicUrl } from "@/lib/image-url";
import { EditProfileDialog } from "@/components/dialogs/EditProfileDialog";
import { getMe, type User } from "@/services/user.services";
import { logoutRequest } from "@/services/auth.services";

export type NavbarProps = {
  brand?: string;
  brandHref?: string;
  profileHandle?: string;
  baseDomain?: string;
  previewHref?: string;
  previewNewTab?: boolean;
  onLogout?: () => void;
  withBorder?: boolean;
  translucent?: boolean;
  rightActions?: React.ReactNode;
  showUserNameNearBrand?: boolean;
  onProfileUpdated?: (user: any) => void;
};

function getInitials(name?: string) {
  if (!name) return "U";
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase())
      .join("") || "U"
  );
}

function useSimpleTheme() {
  const [theme, setTheme] = React.useState<"light" | "dark">("light");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    let initial: "light" | "dark" = "light";
    try {
      const stored = localStorage.getItem("theme");
      if (stored === "dark" || stored === "light") initial = stored;
      else if (window.matchMedia("(prefers-color-scheme: dark)").matches)
        initial = "dark";
    } catch {}
    setTheme(initial);
  }, []);

  React.useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    try {
      localStorage.setItem("theme", theme);
    } catch {}
  }, [theme]);

  return {
    theme,
    mounted,
    toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
  };
}

export function Navbar({
  brand = "Instacard",
  brandHref = "",
  profileHandle,
  baseDomain = "instacard.app",
  previewHref,
  previewNewTab = true,
  onLogout,
  withBorder = true,
  translucent = true,
  rightActions,
  showUserNameNearBrand = false,
  onProfileUpdated,
}: NavbarProps) {
  const router = useRouter();
  const publicUrl = profileHandle ? `${baseDomain}/${profileHandle}` : null;
  const defaultPreviewHref =
    previewHref ?? (profileHandle ? `/${profileHandle}` : "#");
  const { theme, mounted, toggle } = useSimpleTheme();

  const [openEdit, setOpenEdit] = React.useState(false);
  const [profile, setProfile] = React.useState<{
    name: string;
    bio: string;
    avatarUrl: string;
  }>({
    name: "User",
    bio: "",
    avatarUrl: "",
  });
  const [loggingOut, setLoggingOut] = React.useState(false);

  React.useEffect(() => {
    let ok = true;
    (async () => {
      try {
        const u: User = await getMe();
        if (!ok) return;
        const name = (u?.name?.trim() || u?.username?.trim() || "User").slice(
          0,
          80
        );
        const bio = (u?.bio ?? "") || "";
        const avatarUrl =
          toPublicUrl((u as any)?.avatar_url ?? (u as any)?.avatar ?? "") || "";
        setProfile({ name, bio, avatarUrl });
      } catch {}
    })();
    return () => {
      ok = false;
    };
  }, []);

  const avatarSrc = toPublicUrl(profile.avatarUrl) || "";
  const title = mounted
    ? `Switch to ${theme === "dark" ? "light" : "dark"} mode`
    : "Toggle theme";

  const editKey = React.useMemo(
    () => [profile.name, profile.bio, avatarSrc].join("|"),
    [profile.name, profile.bio, avatarSrc]
  );

  const handleLogout = React.useCallback(async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logoutRequest();
      toast.success("Logged out");
      onLogout?.();
      router.replace("/login");
    } catch {
      toast.error("Failed to logout");
    } finally {
      setLoggingOut(false);
    }
  }, [loggingOut, onLogout, router]);

  return (
    <header
      className={[
        "sticky top-0 z-40 transition-all",
        translucent
          ? "bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60"
          : "bg-background",
        withBorder ? "border-b" : "",
        "shadow-sm",
      ].join(" ")}
    >
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-26">
        <div className="flex items-center justify-between py-3.5">
          <div className="flex items-center gap-3">
            <Link href={brandHref} className="inline-flex items-center gap-2">
              <span className="text-2xl font-bold tracking-tight">
                Insta<span className="text-primary">Card</span>
              </span>
              {showUserNameNearBrand && profile.name ? (
                <span className="ml-2 hidden sm:inline text-sm text-muted-foreground">
                  — {profile.name}
                </span>
              ) : null}
            </Link>

            <Separator
              orientation="vertical"
              className="mx-2 h-7 hidden sm:block"
            />

            <Link
              href={defaultPreviewHref}
              target={previewNewTab ? "_blank" : undefined}
              className="inline-flex"
            >
              <Button
                variant="outline"
                className="cursor-pointer rounded-full h-9 px-4 text-sm"
                title="See preview"
              >
                <Eye className="mr-2 h-4 w-4" />
                See preview
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-2.5">
            {rightActions ? (
              <div className="hidden sm:block">{rightActions}</div>
            ) : null}

            {publicUrl && (
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(publicUrl);
                  toast.success("Profile URL copied");
                }}
                className="hidden md:inline-flex cursor-pointer items-center gap-2 rounded-full border bg-card/70 px-3.5 py-1.5 text-[13px] text-muted-foreground shadow-sm"
                title="Copy profile URL"
              >
                <span className="truncate max-w-[200px]">{publicUrl}</span>
                <Copy className="h-3.5 w-3.5 opacity-70" />
              </button>
            )}

            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-full cursor-pointer"
              onClick={toggle}
              title={title}
              aria-label={title}
            >
              {mounted ? (
                theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )
              ) : null}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="outline-none rounded-full focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="User menu"
                >
                  <Avatar className="h-9 w-9 aspect-square shrink-0 rounded-full overflow-hidden ring-1 cursor-pointer ring-border">
                    <AvatarImage
                      className="h-full w-full object-cover"
                      src={avatarSrc}
                      alt={profile.name || "User"}
                    />
                    <AvatarFallback className="text-[11px] font-medium">
                      {getInitials(profile.name)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem
                  className="gap-2 cursor-pointer"
                  onSelect={(e) => {
                    e.preventDefault();
                    setOpenEdit(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                  Edit profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive gap-2 cursor-pointer"
                  onSelect={(e) => {
                    e.preventDefault();
                    handleLogout();
                  }}
                  disabled={loggingOut}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <EditProfileDialog
        key={editKey}
        open={openEdit}
        onOpenChange={setOpenEdit}
        initial={{
          avatarUrl: avatarSrc,
          name: profile.name,
          bio: profile.bio,
        }}
        onSuccess={(user) => {
          setProfile((p) => ({
            name: user.name ?? p.name,
            bio: user.bio ?? p.bio,
            avatarUrl:
              toPublicUrl((user as any).avatar_url ?? (user as any).avatar) ??
              p.avatarUrl,
          }));
          toast.success("Profile updated");
          onProfileUpdated?.(user);
        }}
      />
    </header>
  );
}

export default Navbar;
