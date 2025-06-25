import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// 유저 상태 타입
interface User {
  id: number;
  email: string;
  name: string;
  profile_image: string | null;
  provider: string;
  created_at: string;
}

interface UserState {
  user: User | null;
}

const initialState: UserState = { user: null };

// 유저 상태 전역 관리
export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
    clearUser(state) {
      state.user = null;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
