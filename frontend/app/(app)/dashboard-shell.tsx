"use client";

import * as React from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import type { User } from "@/lib/auth";

export default function DashboardShell({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  const profileHandle = user?.username ?? "";
  const userName = user?.name || user?.username || "User";
  const avatarUrlRaw = (user as any)?.avatar_url ?? (user as any)?.avatar ?? "";

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background text-foreground">
      <Navbar
        brand="Instacard"
        brandHref="/dashboard"
        profileHandle={profileHandle}
        userName={userName}
        avatarUrl={avatarUrlRaw}
        rightActions={
          <Button
            variant="outline"
            className="h-8 rounded-full px-4 cursor-pointer"
          >
            Design
          </Button>
        }
      />
      <main id="main-content" className="flex-1 md:px-10">
        <div>{children}</div>
      </main>
    </div>
  );
}
