import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "@/features/counterSlice";
import { baseApi } from "@/app/api"; // baseApi 위치에 맞게 경로 수정
import userReducer from "@/features/store/userSlice"; // userSlice 위치에 맞게 경로 수정

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    [baseApi.reducerPath]: baseApi.reducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
  devTools: true,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
