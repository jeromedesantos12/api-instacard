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
import { Input } from "@/components/ui/input";
import { createLink, type LinkItem } from "@/services/link.services";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated?: (item: LinkItem) => void;
};

export function AddLinkDialog({ open, onOpenChange, onCreated }: Props) {
  const [saving, setSaving] = React.useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    const title = String(formData.get("title") || "").trim();
    const url = String(formData.get("url") || "").trim();
    if (!title || !url) return;

    try {
      setSaving(true);
      const created = await createLink({ title, url });
      onCreated?.(created);
      toast.success("Link created");
      onOpenChange(false);
      router.refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "Create link failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add a new link</DialogTitle>
          <DialogDescription>
            Enter the title and URL for your Instacard link.
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="Portfolio, YouTube, Store..."
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              name="url"
              type="url"
              placeholder="https://example.com"
              required
            />
          </div>

          <DialogFooter className="mt-2">
            <DialogClose asChild>
              <Button
                className="cursor-pointer"
                type="button"
                variant="ghost"
                disabled={saving}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button className="cursor-pointer" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
