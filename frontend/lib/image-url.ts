export function toPublicUrl(p?: string | null) {
  if (!p) return "";
  const val = String(p).trim();
  if (/^https?:\/\//i.test(val)) return val;

  const base = (process.env.NEXT_PUBLIC_API_IMAGE_URL || "").replace(
    /\/+$/,
    ""
  );
  if (val.startsWith("/uploads/")) return base ? `${base}${val}` : val;
  if (val.startsWith("uploads/")) return base ? `${base}/${val}` : `/${val}`;

  const path = `uploads/user/avatar/${val}`;
  return base ? `${base}/${path}` : `/${path}`;
}
