import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { Mutex } from 'async-mutex';

// refresh 중복 요청 방지용 Mutex 생성
const mutex = new Mutex();

// 일반 API 요청 시 항상 이 baseQuery를 사용함
export const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('accessToken');
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

// customBaseQuery: refresh 토큰 자동 갱신만 담당 (로딩 카운트 X)
export const customBaseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  await mutex.waitForUnlock();

  let result = await baseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          return { error: { status: 401, data: 'No refresh token' } as any };
        }

        const refreshResult = await baseQuery(
          {
            url: '/auth/token/refresh/',
            method: 'POST',
            body: { refresh: refreshToken },
          },
          api,
          extraOptions
        );

        const refreshData = refreshResult.data as { access?: string; refresh?: string };

        if (refreshData?.access) {
          localStorage.setItem('accessToken', refreshData.access);
          if (refreshData.refresh) localStorage.setItem('refreshToken', refreshData.refresh);

          // 원래 실패했던 요청 재시도
          result = await baseQuery(args, api, extraOptions);
        } else {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          return { error: { status: 401, data: 'Token refresh failed' } as any };
        }
      } finally {
        release();
      }
    } else {
      await mutex.waitForUnlock();
      result = await baseQuery(args, api, extraOptions);
    }
  }

  return result;
};

// 인증이 필요없는 API 요청용
export const publicApi = createApi({
  reducerPath: 'publicApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
  }),
  endpoints: () => ({}),
});

// 인증이 필요한 보호 API 요청용
export const privateApi = createApi({
  reducerPath: 'privateApi',
  baseQuery: customBaseQuery,
  endpoints: () => ({}),
  tagTypes: ['User', 'Feedback'],
});

// 스캔 전용 API (중요: reducerPath가 달라서 loadingMiddleware에 안 걸리게 만들 수 있음)
export const scanPrivateApi = createApi({
  reducerPath: 'scanPrivateApi',
  baseQuery: customBaseQuery,
  endpoints: () => ({}),
  tagTypes: ['Scan'],
});
