import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { Mutex } from 'async-mutex';

const DEFAULT_API_BASE_URL =
  'https://webridge-backend-development.up.railway.app/api/v1';

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL
).replace(/\/+$/, '');

// refresh 중복 요청 방지용 Mutex 생성
const mutex = new Mutex();

// 일반 API 요청 시 항상 이 baseQuery를 사용함
export const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
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
            url: '/auth/token/refresh',
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
    baseUrl: API_BASE_URL,
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

// 관리자 전용 BaseQuery (admin_access_token 헤더 첨부 + 401 시 로그인 리다이렉트)
const rawAdminBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('admin_access_token');
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

export const adminBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawAdminBaseQuery(args, api, extraOptions);

  const reqUrl = typeof args === 'string' ? args : args.url;
  const isLoginRequest = reqUrl.includes('/admin/login');

  if (result.error?.status === 401 && !isLoginRequest) {
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_user');
    if (
      typeof window !== 'undefined' &&
      !window.location.pathname.startsWith('/admin/login')
    ) {
      window.location.href = '/admin/login';
    }
  }

  return result;
};

// 관리자 전용 API (전역 loadingMiddleware 미적용)
export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: adminBaseQuery,
  endpoints: () => ({}),
  tagTypes: [
    'AdminDashboard',
    'AdminUsers',
    'AdminUserDetail',
    'AdminScans',
    'AdminScanDetail',
    'AdminTerms',
    'AdminSurveys',
    'AdminAltTextFeedback',
  ],
});
