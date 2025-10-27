import { api } from "@/lib/api";

export type SocialPlatform =
  | "instagram"
  | "tiktok"
  | "x"
  | "linkedin"
  | "youtube"
  | "github";

export type SocialLink = {
  id: string;
  user_id: string;
  platform: SocialPlatform;
  username: string;
  url: string;
  order_index: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ApiEnvelope<T> = {
  status: "success" | "error" | string;
  message: string;
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasPrev: boolean;
    hasNext: boolean;
    sortBy: "created_at" | "order_index";
    order: "asc" | "desc";
  };
};

export type GetSocialsParams = {
  sort?: "order" | "created_at";
  order?: "asc" | "desc";
};

function normalizeInboundPlatform(list: any[]): SocialLink[] {
  return (list ?? []).map((item) => {
    const platform =
      item?.platform === "twitter"
        ? ("x" as SocialPlatform)
        : (item?.platform as SocialPlatform);
    return { ...item, platform } as SocialLink;
  });
}

function normalizeOutboundPlatform(p: SocialPlatform | string): string {
  return p === "x" ? "twitter" : p;
}

export async function getSocials(params: GetSocialsParams = {}) {
  const qs = new URLSearchParams();
  if (params.sort) qs.set("sort", params.sort);
  if (params.order) qs.set("order", params.order);

  const url = `/social/all${qs.toString() ? `?${qs.toString()}` : ""}`;
  const res = await api.get<ApiEnvelope<SocialLink[]>>(url);
  const data = Array.isArray(res.data?.data) ? res.data.data : [];
  return {
    ...res.data,
    data: normalizeInboundPlatform(data),
  };
}

export async function getActiveSocials(params: GetSocialsParams = {}) {
  const qs = new URLSearchParams();
  if (params.sort) qs.set("sort", params.sort);
  if (params.order) qs.set("order", params.order);

  const url = `/social/active${qs.toString() ? `?${qs.toString()}` : ""}`;
  const res = await api.get<ApiEnvelope<SocialLink[]>>(url);
  const data = Array.isArray(res.data?.data) ? res.data.data : [];
  return {
    ...res.data,
    data: normalizeInboundPlatform(data),
  };
}

export type UpsertSocialInput = {
  platform: SocialPlatform | string;
  username: string;
};

export async function upsertSocial(input: UpsertSocialInput) {
  const payload = {
    ...input,
    platform: normalizeOutboundPlatform(input.platform),
  };
  const res = await api.put<ApiEnvelope<SocialLink>>(`/social`, payload);
  const normalized = res.data?.data
    ? normalizeInboundPlatform([res.data.data])[0]
    : res.data?.data;
  return { ...res.data, data: normalized as SocialLink };
}

export async function updateSocialOrder(id: string, order_index: number) {
  const res = await api.patch<ApiEnvelope<SocialLink>>(`/social/${id}/order`, {
    order_index,
  });
  const normalized = res.data?.data
    ? normalizeInboundPlatform([res.data.data])[0]
    : res.data?.data;
  return { ...res.data, data: normalized as SocialLink };
}

export async function restoreSocial(id: string) {
  const res = await api.put<ApiEnvelope<SocialLink>>(`/social/${id}`);
  const normalized = res.data?.data
    ? normalizeInboundPlatform([res.data.data])[0]
    : res.data?.data;
  return { ...res.data, data: normalized as SocialLink };
}

export async function SoftDeleteSocial(id: string) {
  const { data } = await api.delete<ApiEnvelope<SocialLink>>(
    `/social/soft/${encodeURIComponent(id.trim())}`
  );
  const normalized = data?.data
    ? normalizeInboundPlatform([data.data])[0]
    : data?.data;
  return { ...data, data: normalized as SocialLink };
}

export async function HardDeleteSocial(id: string) {
  const { data } = await api.delete<ApiEnvelope<SocialLink>>(
    `/social/hard/${encodeURIComponent(id.trim())}`
  );
  const normalized = data?.data
    ? normalizeInboundPlatform([data.data])[0]
    : data?.data;
  return { ...data, data: normalized as SocialLink };
}
