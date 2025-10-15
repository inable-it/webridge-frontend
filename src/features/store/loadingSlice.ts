import { createSlice } from "@reduxjs/toolkit";

interface LoadingState {
  count: number; // API 로딩 카운트 (RTK Query 미들웨어가 관리)
  routeActive: boolean; // 라우트 전환 중 여부 (RouteLoadingBinder가 관리)
}
const initialState: LoadingState = { count: 0, routeActive: false };

const loadingSlice = createSlice({
  name: "loading",
  initialState,
  reducers: {
    start(state) {
      state.count += 1;
    },
    stop(state) {
      state.count = Math.max(0, state.count - 1);
    },
    reset(state) {
      state.count = 0;
    },
    setRouteActive(state, action: { payload: boolean }) {
      state.routeActive = action.payload;
    },
  },
});

export const { start, stop, reset, setRouteActive } = loadingSlice.actions;
export default loadingSlice.reducer;
