import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
} from "@reduxjs/toolkit/query/react";
import { Mutex } from "async-mutex";

// refresh 중복 요청 방지용 Mutex 생성
const mutex = new Mutex();

// 일반 API 요청 시 항상 이 baseQuery를 사용함
const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  prepareHeaders: (headers) => {
    // accessToken이 있으면 Authorization 헤더에 포함
    const token = localStorage.getItem("accessToken");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

// customBaseQuery: refresh 토큰 자동 갱신 포함 버전
export const customBaseQuery: BaseQueryFn = async (args, api, extraOptions) => {
  await mutex.waitForUnlock(); // 다른 refresh 중이라면 대기

  let result = await baseQuery(args, api, extraOptions);

  // 401 → accessToken 만료 의심
  if (result.error?.status === 401) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire(); // refresh 중복 방지 잠금

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          // refreshToken 없으면 바로 실패
          return { error: { status: 401, data: "No refresh token" } };
        }

        // refresh API 호출
        const refreshResult = await baseQuery(
          {
            url: "/api/v1/auth/token/refresh/",
            method: "POST",
            body: { refresh: refreshToken },
          },
          api,
          extraOptions
        );

        const refreshData = refreshResult.data as { access: string };

        if (refreshData?.access) {
          // 새 accessToken 저장
          localStorage.setItem("accessToken", refreshData.access);
          // 원래 실패했던 요청 재시도
          result = await baseQuery(args, api, extraOptions);
        } else {
          // refresh 실패 → 로그아웃 처리
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          return { error: { status: 401, data: "Token refresh failed" } };
        }
      } finally {
        release(); // unlock
      }
    } else {
      // 다른 refresh 요청 대기
      await mutex.waitForUnlock();
      result = await baseQuery(args, api, extraOptions);
    }
  }

  return result;
};

// 인증이 필요없는 API 요청용 (로그인, 회원가입, 소셜로그인, 로그아웃)
export const publicApi = createApi({
  reducerPath: "publicApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
  }),
  endpoints: () => ({}),
});

// 인증이 필요한 보호 API 요청용 (refresh 자동 포함됨)
export const privateApi = createApi({
  reducerPath: "privateApi",
  baseQuery: customBaseQuery,
  endpoints: () => ({}),
  tagTypes: ['Scan', 'User', 'Feedback'],
});
