"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateMe, type User } from "@/services/user.services";
import { useRouter } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: { avatarUrl: string; name: string; bio: string };
  onSuccess?: (user: User) => void;
};

export function EditProfileDialog({
  open,
  onOpenChange,
  initial,
  onSuccess,
}: Props) {
  const [preview, setPreview] = React.useState<string>(initial.avatarUrl);
  const [saving, setSaving] = React.useState(false);
  const fileUrlRef = React.useRef<string | null>(null);
  const formRef = React.useRef<HTMLFormElement | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  React.useEffect(() => {
    setPreview(initial.avatarUrl || "");
    if (open) {
      formRef.current?.reset();
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
    return () => {
      if (fileUrlRef.current) {
        URL.revokeObjectURL(fileUrlRef.current);
        fileUrlRef.current = null;
      }
    };
  }, [initial.avatarUrl, open]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (fileUrlRef.current) {
      URL.revokeObjectURL(fileUrlRef.current);
      fileUrlRef.current = null;
    }
    const url = URL.createObjectURL(file);
    fileUrlRef.current = url;
    setPreview(url);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = (form.get("name") as string) || undefined;
    const bio = (form.get("bio") as string) || undefined;
    const file = (form.get("avatar") as File) || null;
    try {
      setSaving(true);
      const user = await updateMe({
        name,
        bio,
        avatarFile: file && file.size > 0 ? file : null,
      });
      onSuccess?.(user);
      onOpenChange(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v && fileUrlRef.current) {
          URL.revokeObjectURL(fileUrlRef.current);
          fileUrlRef.current = null;
        }
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your avatar, full name, and bio.
          </DialogDescription>
        </DialogHeader>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="shrink-0">
              <div className="h-20 w-20 overflow-hidden rounded-full ring-1 ring-border bg-muted">
                <Avatar className="h-full w-full">
                  <AvatarImage
                    className="object-cover"
                    src={preview || ""}
                    alt="Avatar preview"
                  />
                  <AvatarFallback className="text-xs md:text-sm">
                    No Avatar
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>

            <div className="grid w-full gap-2">
              <Label htmlFor="avatar">Upload Avatar</Label>
              <Input
                ref={fileInputRef}
                id="avatar"
                name="avatar"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
              <p className="text-xs text-muted-foreground">
                Formats: JPG atau. Max 10MB.
              </p>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={initial.name}
              placeholder="Your full name"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              defaultValue={initial.bio}
              placeholder="Tell something about yourself..."
              rows={4}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button className="cursor-pointer" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
