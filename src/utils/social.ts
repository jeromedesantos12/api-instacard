import { SocialPlatform } from "@prisma/client";

export const SOCIAL_BASE: Record<SocialPlatform, string> = {
  instagram: "https://instagram.com/",
  tiktok: "https://www.tiktok.com/@",
  x: "https://x.com/",
  linkedin: "https://www.linkedin.com/in/",
  youtube: "https://www.youtube.com/@",
  github: "https://github.com/",
};

const RX = {
  instagram: /^[a-zA-Z0-9._-]{1,30}$/,
  tiktok: /^[a-zA-Z0-9._-]{1,30}$/,
  x: /^[a-zA-Z0-9._-]{1,30}$/,
  linkedin: /^[a-zA-Z0-9-]{3,100}$/,
  youtube: /^[a-zA-Z0-9._-]{3,100}$/,
  github: /^[a-zA-Z0-9-]{1,39}$/,
} as const;

export function normalizeUsername(platform: SocialPlatform, raw: string) {
  let s = (raw ?? "").trim();
  if (!s) throw new Error("Username is required");
  if (s.startsWith("@")) s = s.slice(1);
  const ok = RX[platform].test(s);
  if (!ok) throw new Error("Invalid username format");
  return s;
}

export function buildSocialUrl(platform: SocialPlatform, username: string) {
  return `${SOCIAL_BASE[platform]}${username}`;
}
