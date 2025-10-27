import { api } from "@/lib/api";

export type User = {
  id: string;
  email: string;
  username: string;
  name: string;
  bio: string | null;
  avatar: string | null;
  banner: string | null;
};

type ApiResponse<T> = {
  status?: string;
  message?: string;
  data?: T;
} & Record<string, unknown>;

function unwrap<T>(resData: unknown): T {
  const d = resData as ApiResponse<T> | T;
  if (d && typeof d === "object" && "data" in (d as any)) {
    return (d as ApiResponse<T>).data as T;
  }
  return d as T;
}

export async function getMe(): Promise<User> {
  const res = await api.get("/user/me");
  return unwrap<User>(res.data);
}

export type UpdateMePayload = {
  name?: string;
  bio?: string;
  theme?: string;
  avatar?: string | null;
  banner?: string | null;
  avatarFile?: File | null;
  bannerFile?: File | null;
};

export async function updateMe(payload: UpdateMePayload): Promise<User> {
  const fd = new FormData();
  if (payload.name !== undefined) fd.append("name", payload.name);
  if (payload.bio !== undefined) fd.append("bio", payload.bio);
  if (payload.theme !== undefined) fd.append("theme", payload.theme);
  if (payload.avatarFile) fd.append("avatar_url", payload.avatarFile);
  else if (payload.avatar !== undefined)
    fd.append("avatar", payload.avatar ?? "");
  if (payload.bannerFile) fd.append("banner", payload.bannerFile);
  else if (payload.banner !== undefined)
    fd.append("banner", payload.banner ?? "");
  const res = await api.patch("/user/me", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return unwrap<User>(res.data);
}

export type PublicLink = {
  id: string;
  title: string;
  url: string;
  description?: string | null;
  order?: number;
  is_active?: boolean;
};

export type PublicSocial = {
  platform:
    | "instagram"
    | "tiktok"
    | "x"
    | "linkedin"
    | "youtube"
    | "github"
    | string;
  url: string;
  username?: string;
};

export type PublicProfile = User & {
  theme?: string | null;
  socials?: PublicSocial[];
  links: PublicLink[];
};

export async function getPublicProfile(
  username: string
): Promise<PublicProfile | null> {
  try {
    const res = await api.get(`/user/u/${encodeURIComponent(username)}`, {
      headers: { Accept: "application/json" },
    });

    const ct = String(res.headers?.["content-type"] || "");
    if (!ct.includes("application/json")) {
      const raw =
        typeof res.data === "string"
          ? res.data.slice(0, 160)
          : JSON.stringify(res.data ?? "").slice(0, 160);
      throw new Error(`Expected JSON but got "${ct}". Preview: ${raw}`);
    }

    const data = unwrap<PublicProfile>(res.data);
    if (!data || typeof data !== "object")
      throw new Error("Invalid JSON shape for public profile");
    (data as any).links = Array.isArray((data as any).links)
      ? (data as any).links
      : [];
    return data;
  } catch (e: any) {
    if (e?.response?.status === 404) return null;
    const ct: string = e?.response?.headers?.["content-type"] ?? "";
    if (ct && !ct.includes("application/json")) {
      const raw = e?.response?.data;
      const preview =
        typeof raw === "string"
          ? raw.slice(0, 160)
          : JSON.stringify(raw ?? "").slice(0, 160);
      throw new Error(`Expected JSON but got "${ct}". Preview: ${preview}`);
    }
    throw e;
  }
}
