import { configureStore, combineReducers } from "@reduxjs/toolkit";
import userReducer from "@/features/store/userSlice";
import menuReducer from "@/features/store/menuSlice";
import { publicApi, privateApi } from "@/app/api";
import storage from "redux-persist/lib/storage";
import { persistStore, persistReducer } from "redux-persist";

const rootReducer = combineReducers({
  user: userReducer,
  menu: menuReducer,
  [publicApi.reducerPath]: publicApi.reducer,
  [privateApi.reducerPath]: privateApi.reducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["user", "menu"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false })
      .concat(publicApi.middleware)
      .concat(privateApi.middleware),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
