"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { SocialPlatform } from "@/services/social.services";
import type { IconType } from "react-icons";
import {
  FaInstagram,
  FaTiktok,
  FaLinkedin,
  FaYoutube,
  FaGithub,
  FaXTwitter,
} from "react-icons/fa6";

type PlatformOption = {
  key: SocialPlatform;
  label: string;
  icon: IconType;
  usernameHint: string;
};

const PLATFORM_OPTIONS: PlatformOption[] = [
  {
    key: "instagram",
    label: "Instagram",
    icon: FaInstagram,
    usernameHint: "your_username",
  },
  {
    key: "tiktok",
    label: "TikTok",
    icon: FaTiktok,
    usernameHint: "your.username",
  },
  {
    key: "x",
    label: "X (Twitter)",
    icon: FaXTwitter,
    usernameHint: "your_username",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    icon: FaLinkedin,
    usernameHint: "your-profile",
  },
  {
    key: "youtube",
    label: "YouTube",
    icon: FaYoutube,
    usernameHint: "yourhandle",
  },
  {
    key: "github",
    label: "GitHub",
    icon: FaGithub,
    usernameHint: "your-username",
  },
];

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;

  onSuccess?: () => void;

  onSave?: (payload: {
    platform: SocialPlatform;
    username: string;
  }) => Promise<void> | void;

  endpoint?: string;
};

export function AddSocialDialog({
  open,
  onOpenChange,
  onSuccess,
  onSave,
  endpoint = "/social",
}: Props) {
  const [platform, setPlatform] = React.useState<SocialPlatform | "">("");
  const [username, setUsername] = React.useState<string>("");
  const [saving, setSaving] = React.useState(false);

  const selected = PLATFORM_OPTIONS.find((p) => p.key === platform);
  const usernamePlaceholder = selected?.usernameHint ?? "username";

  function normalizeUsername(raw: string) {
    return raw.trim().replace(/^@+/, "");
  }

  async function defaultSave(payload: {
    platform: SocialPlatform;
    username: string;
  }) {
    const res = await fetch(endpoint, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg = err?.message || "Failed to save social link";
      throw new Error(msg);
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!platform) return;

    const normalized = normalizeUsername(username);
    const payload = {
      platform: platform as SocialPlatform,
      username: normalized,
    };

    try {
      setSaving(true);
      if (onSave) {
        await onSave(payload);
      } else {
        await defaultSave(payload);
      }
      // toast.success("Social link saved"); // optional
      onOpenChange(false);
      setUsername("");
      setPlatform("");
      onSuccess?.();
    } catch (err: any) {
      // toast.error(err?.message ?? "Failed to save"); // optional
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const canSubmit = Boolean(platform) && username.trim().length > 0 && !saving;

  return (
    <Dialog open={open} onOpenChange={(v) => !saving && onOpenChange(v)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add social</DialogTitle>
          <DialogDescription>
            Choose a platform and enter your account username.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <input type="hidden" name="platform" value={platform} required />

          <div className="grid gap-2">
            <Label htmlFor="platform">Platform</Label>
            <Select
              value={platform || undefined}
              onValueChange={(v) => setPlatform(v as SocialPlatform)}
            >
              <SelectTrigger id="platform">
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                {PLATFORM_OPTIONS.map((p) => {
                  const Icon = p.icon;
                  return (
                    <SelectItem key={p.key} value={p.key}>
                      <span className="flex items-center gap-2">
                        <Icon className="h-4 w-4" aria-hidden />
                        <span>{p.label}</span>
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              type="text"
              inputMode="text"
              placeholder={usernamePlaceholder}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Enter <span className="font-medium">username</span> only (no URL).
              Leading “@” will be removed automatically.
            </p>
          </div>

          <DialogFooter className="mt-2">
            <DialogClose asChild>
              <Button type="button" variant="ghost" disabled={saving}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={!canSubmit}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
