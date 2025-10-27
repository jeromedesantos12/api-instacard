"use server";

import "server-only";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

// Prefer same-origin proxy. Kalau kamu set NEXT_PUBLIC_API_URL, pastikan ada /api/v1 di ujungnya.
const RAW_BASE =
  process.env.NEXT_PUBLIC_API_URL || process.env.API_BASE_URL || "/api/v1";

const API_BASE = RAW_BASE.replace(/\/$/, "");

export type User = {
  id: string;
  email: string;
  username: string;
  name: string;
  bio: string | null;
  avatar: string | null;
  banner: string | null;
};

async function fetchJson<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, { cache: "no-store", ...init });
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    // Gunakan same-origin proxy atau absolute yang sudah benar.
    // Jika API_BASE diawali "http", fetch ke sana; kalau tidak, dianggap path relatif same-origin.
    const url = API_BASE.startsWith("http")
      ? `${API_BASE}/user/me`
      : `${API_BASE}/user/me`;

    // Teruskan cookie agar session kebaca oleh route handler/proxy
    const cookieHeader = cookies().toString();
    if (!cookieHeader) return null;

    const data = await fetchJson<any>(url, {
      method: "GET",
      headers: { cookie: cookieHeader },
    });

    const payload = data?.data ?? data;
    return payload as User;
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<User> {
  const u = await getCurrentUser();
  if (!u) redirect("/login");
  return u;
}
