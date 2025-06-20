import { combineReducers, configureStore } from "@reduxjs/toolkit";
import counterReducer from "@/features/counterSlice";
import { baseApi } from "@/app/api";
import userReducer from "@/features/store/userSlice";

import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

// 먼저 combineReducers로 여러 reducer 통합
const rootReducer = combineReducers({
  counter: counterReducer,
  user: userReducer,
  [baseApi.reducerPath]: baseApi.reducer,
});

// persist 설정
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["user"], // user slice만 저장
};

// persistReducer 적용
const persistedReducer = persistReducer(persistConfig, rootReducer);

// 최종 store 생성
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(baseApi.middleware),
  devTools: true,
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
