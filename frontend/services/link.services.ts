import { api } from "@/lib/api";
import { getErrMsg } from "./auth.services";

export type LinkItem = {
  id: string;
  user_id: string;
  title: string;
  url: string;
  order_index: number;
  created_at: string;
  updated_at: string;
};

type ApiListResponse<T> = {
  status?: string;
  message?: string;
  data?: T[];
  meta?: { total: number; page: number; limit: number };
} & Record<string, unknown>;

export type GetLinksParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export async function getLinks(params: GetLinksParams = {}): Promise<{
  items: LinkItem[];
  meta: { total: number; page: number; limit: number };
}> {
  try {
    const res = await api.get("/link", { params });
    const body = res.data as
      | ApiListResponse<LinkItem>
      | { data: LinkItem[]; meta: any };
    const items = (body as any).data ?? (body as any);
    const meta =
      (body as any).meta ??
      ({
        total: items?.length ?? 0,
        page: params.page ?? 1,
        limit: params.limit ?? items?.length ?? 0,
      } as any);
    return { items: items ?? [], meta };
  } catch (e) {
    throw new Error(getErrMsg(e, "Fetch links failed"));
  }
}

export type CreateLinkBody = {
  title: string;
  url: string;
};

export async function createLink(input: CreateLinkBody): Promise<LinkItem> {
  try {
    const res = await api.post("/link", input);
    const body = res.data as
      | { status?: string; message?: string; data?: LinkItem }
      | LinkItem;
    const item = (body as any).data ?? body;
    return item as LinkItem;
  } catch (e) {
    throw new Error(getErrMsg(e, "Create link failed"));
  }
}

export type UpdateLinkBody = {
  title: string;
  url: string;
};

export async function updateLink(
  id: string,
  input: UpdateLinkBody
): Promise<LinkItem> {
  try {
    const res = await api.patch(`/link/${id}`, input);
    const body = res.data as
      | { status?: string; message?: string; data?: LinkItem }
      | LinkItem;
    const item = (body as any).data ?? body;
    return item as LinkItem;
  } catch (e) {
    throw new Error(getErrMsg(e, "Update link failed"));
  }
}

export async function deleteLink(id: string): Promise<LinkItem> {
  try {
    const res = await api.delete(`/link/${id}`);
    const body = res.data as
      | { status?: string; message?: string; data?: LinkItem }
      | LinkItem;
    const item = (body as any).data ?? body;
    return item as LinkItem;
  } catch (e) {
    throw new Error(getErrMsg(e, "Delete link failed"));
  }
}
