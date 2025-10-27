"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateLink as updateLinkSvc } from "@/services/link.services";

type EditLinkDialogProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  id?: string | null;
  initial: { title: string; url: string };
  onSuccess?: () => void | Promise<void>;
};

export function EditLinkDialog({
  open,
  onOpenChange,
  id,
  initial,
  onSuccess,
}: EditLinkDialogProps) {
  const [title, setTitle] = React.useState(initial.title);
  const [url, setUrl] = React.useState(initial.url);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    setTitle(initial.title);
    setUrl(initial.url);
  }, [initial]);

  async function handleSave() {
    if (!id) return;
    const t = title.trim();
    const u = url.trim();
    if (!t || !u) return;
    try {
      setSaving(true);
      await updateLinkSvc(id, { title: t, url: u });
      if (onSuccess) await onSuccess();
      toast.success("Link updated");
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to update link");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Link</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. My Portfolio"
              disabled={saving}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-url">URL</Label>
            <Input
              id="edit-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              inputMode="url"
              disabled={saving}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            className="cursor-pointer"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            className="cursor-pointer"
            onClick={handleSave}
            disabled={saving || !id}
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
