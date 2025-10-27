import type { RegisterPayload, LoginPayload } from "@/types/auth";
import type { ApiResponse } from "@/types/api";
import { api } from "@/lib/api";
import type { AxiosError } from "axios";

export const getErrMsg = (e: unknown, fallback: string) => {
  const err = e as AxiosError<any>;
  return (err.response?.data?.message as string) ?? err.message ?? fallback;
};

export async function registerRequest(body: RegisterPayload) {
  try {
    const res = await api.post<ApiResponse<unknown>>("/auth/register", body);
    return res.data;
  } catch (e) {
    throw new Error(getErrMsg(e, "Request failed"));
  }
}

export async function loginRequest(body: LoginPayload) {
  try {
    const res = await api.post<ApiResponse<{ token?: string }>>(
      "/auth/login",
      body
    );
    return res.data;
  } catch (e) {
    throw new Error(getErrMsg(e, "Login failed"));
  }
}

export async function logoutRequest() {
  try {
    const res = await api.post<ApiResponse<null>>("/auth/logout", {});
    return res.data;
  } catch (e) {
    throw new Error(getErrMsg(e, "Logout failed"));
  }
}

export async function verifyRequest() {
  try {
    const res = await api.get<ApiResponse<{ id: string }>>("/auth/verify", {
      withCredentials: true,
    });
    return res.data;
  } catch (e) {
    throw new Error(getErrMsg(e, "Verify failed"));
  }
}
