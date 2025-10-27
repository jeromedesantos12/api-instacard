import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { LoginPayload } from "@/types/auth";
import { loginRequest, logoutRequest } from "@/services/auth.services";
import { getMe as getMeRequest, type User } from "@/services/user.services";

type ApiEnvelope<T> = {
  status?: string;
  message?: string;
  data?: unknown;
  user?: unknown;
} & Record<string, unknown>;

function unwrap<T>(raw: unknown): T {
  const r = raw as ApiEnvelope<T> | T;
  if (r && typeof r === "object") {
    if ("user" in r && (r as any).user) return (r as any).user as T;
    if ("data" in r && (r as any).data) return (r as any).data as T;
  }
  return r as T;
}

export type AuthState = {
  user: User | null;
  status: "idle" | "loading" | "authenticated" | "error";
  error: string | null;
  lastFetchedAt: number | null;
  bootstrapped: boolean;
};

const initialState: AuthState = {
  user: null,
  status: "idle",
  error: null,
  lastFetchedAt: null,
  bootstrapped: false,
};

function onAuthPage() {
  if (typeof window === "undefined") return false;
  const p = window.location.pathname;
  return p === "/login" || p === "/register" || p === "/forgot-password";
}

export const getMe = createAsyncThunk<
  User,
  void,
  { state: { auth: AuthState } }
>("auth/getMe", async (_, { getState, rejectWithValue }) => {
  if (onAuthPage()) return rejectWithValue("skip_on_auth_page");
  const now = Date.now();
  const last = getState().auth.lastFetchedAt;
  if (last && now - last < 3000) return rejectWithValue("throttled");
  try {
    const res = await getMeRequest();
    const user = unwrap<User>((res as any)?.data ?? res);
    if (!user || !user.id) throw new Error("Unauthorized");
    return user;
  } catch (e: any) {
    const msg =
      e?.response?.status === 401
        ? "unauthorized"
        : e?.message || "getMe_failed";
    return rejectWithValue(msg);
  }
});

export const login = createAsyncThunk<
  User | null,
  LoginPayload,
  { rejectValue: string }
>("auth/login", async (payload, { rejectWithValue }) => {
  try {
    await loginRequest(payload);
    try {
      const meRes = await getMeRequest();
      const me = unwrap<User>((meRes as any)?.data ?? meRes);
      return me?.id ? me : null;
    } catch {
      return null;
    }
  } catch (e: any) {
    const msg = e?.response?.data?.message || e?.message || "login_failed";
    return rejectWithValue(msg);
  }
});

/** Logout sederhana */
export const logout = createAsyncThunk("auth/logout", async () => {
  try {
    await logoutRequest();
  } catch {
    /* noop */
  }
  return null;
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetAuth(state) {
      state.user = null;
      state.status = "idle";
      state.error = null;
      state.lastFetchedAt = null;
      state.bootstrapped = false;
    },
    setBootstrapped(state, action: PayloadAction<boolean | undefined>) {
      state.bootstrapped = action.payload ?? true;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getMe.pending, (s) => {
      s.status = "loading";
      s.error = null;
    });
    builder.addCase(getMe.fulfilled, (s, a: PayloadAction<User>) => {
      s.status = "authenticated";
      s.user = a.payload;
      s.lastFetchedAt = Date.now();
    });
    builder.addCase(getMe.rejected, (s, a) => {
      s.status = a.payload === "unauthorized" ? "idle" : "error";
      s.error = (a.payload as string) ?? a.error.message ?? "getMe_failed";
      if (a.payload === "unauthorized") s.user = null;
      s.lastFetchedAt = Date.now();
    });

    builder.addCase(login.pending, (s) => {
      s.status = "loading";
      s.error = null;
    });
    builder.addCase(login.fulfilled, (s, a: PayloadAction<User | null>) => {
      if (a.payload?.id) {
        s.status = "authenticated";
        s.user = a.payload;
      } else {
        s.status = "idle";
      }
    });
    builder.addCase(login.rejected, (s, a) => {
      s.status = "error";
      s.error = (a.payload as string) ?? a.error.message ?? "login_failed";
      s.user = null;
    });

    builder.addCase(logout.fulfilled, (s) => {
      Object.assign(s, initialState);
    });
  },
});

export const { resetAuth, setBootstrapped } = authSlice.actions;
export default authSlice.reducer;

export const selectUser = (s: { auth: AuthState }) => s.auth.user;
export const selectUserId = (s: { auth: AuthState }) => s.auth.user?.id ?? null;
export const selectAuthStatus = (s: { auth: AuthState }) => s.auth.status;
export const selectAuthError = (s: { auth: AuthState }) => s.auth.error;
export const selectIsAuthenticated = (s: { auth: AuthState }) =>
  s.auth.status === "authenticated" && !!s.auth.user?.id;
