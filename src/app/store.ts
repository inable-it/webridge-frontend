import { configureStore, combineReducers } from '@reduxjs/toolkit';
import userReducer from '@/features/store/userSlice';
import menuReducer from '@/features/store/menuSlice';
import loadingReducer from '@/features/store/loadingSlice';
import { publicApi, privateApi, scanPrivateApi } from '@/app/api';
import storage from 'redux-persist/lib/storage';
import { persistStore, persistReducer } from 'redux-persist';
import { loadingMiddleware } from '@/app/loadingMiddleware';

const rootReducer = combineReducers({
  user: userReducer,
  menu: menuReducer,
  loading: loadingReducer,
  [publicApi.reducerPath]: publicApi.reducer,
  [privateApi.reducerPath]: privateApi.reducer,
  [scanPrivateApi.reducerPath]: scanPrivateApi.reducer, // 추가
});

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false })
      .concat(publicApi.middleware)
      .concat(privateApi.middleware)
      .concat(scanPrivateApi.middleware) // 추가
      .concat(loadingMiddleware),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
