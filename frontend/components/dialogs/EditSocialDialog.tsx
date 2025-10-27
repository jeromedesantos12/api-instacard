"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  platform:
    | "instagram"
    | "tiktok"
    | "x"
    | "linkedin"
    | "youtube"
    | "github"
    | null;
  initialUsername?: string | null;
  onSave: (payload: {
    platform: string;
    username: string;
  }) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
};

export function EditSocialDialog({
  open,
  onOpenChange,
  platform,
  initialUsername,
  onSave,
  onDelete,
}: Props) {
  const [username, setUsername] = React.useState(initialUsername ?? "");
  const [loading, setLoading] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    setUsername(initialUsername ?? "");
  }, [initialUsername, platform, open]);

  const label = React.useMemo(() => {
    if (!platform) return "";
    const map: Record<string, string> = {
      instagram: "Instagram",
      tiktok: "TikTok",
      x: "X",
      linkedin: "LinkedIn",
      youtube: "YouTube",
      github: "GitHub",
    };
    return map[platform] ?? platform;
  }, [platform]);

  const handleSave = async () => {
    if (!platform) return;
    const u = username.trim();
    if (!u) return;
    setLoading(true);
    try {
      await onSave({ platform, username: u });
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setDeleting(true);
    try {
      await onDelete();
      onOpenChange(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Social</DialogTitle>
          <DialogDescription>Update your {label} username.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">Platform</div>
          <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
            {label}
          </div>
          <div className="text-sm">Username</div>
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username"
          />
        </div>
        <DialogFooter className="flex items-center justify-between gap-2">
          {onDelete ? (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting || loading}
            >
              {deleting ? "Deactivatingπ..." : "Deactive"}
            </Button>
          ) : (
            <div />
          )}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading || deleting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading || deleting || !platform || !username.trim()}
            >
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
