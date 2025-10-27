import * as React from "react";
import { requireUser } from "@/lib/auth";
import DashboardShell from "./dashboard-shell";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  return <DashboardShell user={user}>{children}</DashboardShell>;
}
