import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { getMe, type User } from "@/services/user.services";

type UserState = {
  me: User | null;
  status: "idle" | "loading" | "loaded" | "error";
  error: string | null;
};

const initialState: UserState = {
  me: null,
  status: "idle",
  error: null,
};

export const fetchMe = createAsyncThunk<User, void, { rejectValue: string }>(
  "user/fetchMe",
  async (_, { rejectWithValue }) => {
    try {
      const user = await getMe(); // <-- tanpa id
      if (!user || !user.id) throw new Error("Invalid me response");
      return user;
    } catch (e: any) {
      const msg = e?.message ?? "Failed to fetch user";
      return rejectWithValue(msg);
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    resetUser(state) {
      state.me = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchMe.pending, (s) => {
      s.status = "loading";
      s.error = null;
    })
      .addCase(fetchMe.fulfilled, (s, a: PayloadAction<User>) => {
        s.status = "loaded";
        s.me = a.payload;
      })
      .addCase(fetchMe.rejected, (s, a) => {
        s.status = "error";
        s.error =
          (a.payload as string) ?? a.error.message ?? "Failed to fetch user";
        s.me = null;
      });
  },
});

export const { resetUser } = userSlice.actions;
export default userSlice.reducer;

export const selectMe = (s: { user: UserState }) => s.user.me;
export const selectUserStatus = (s: { user: UserState }) => s.user.status;
export const selectUserError = (s: { user: UserState }) => s.user.error;
