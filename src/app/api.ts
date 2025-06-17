import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import { Mutex } from "async-mutex";

// 동시 refresh 요청 방지를 위한 뮤텍스
const mutex = new Mutex();

// 기본 baseQuery (Authorization 헤더 포함)
const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

// 커스텀 baseQuery - accessToken 만료 시 refreshToken으로 자동 갱신
const customBaseQuery: BaseQueryFn = async (args, api, extraOptions) => {
  await mutex.waitForUnlock();

  let result = await baseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        const refreshResult = await baseQuery(
          {
            url: "auth/token/refresh/",
            method: "POST",
            body: { refresh: refreshToken },
          },
          api,
          extraOptions
        );

        const refreshData = refreshResult.data as { access: string };

        if (refreshData?.access) {
          localStorage.setItem("accessToken", refreshData.access);
          result = await baseQuery(args, api, extraOptions);
        } else {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
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

// RTK Query API 인스턴스 정의
export const baseApi = createApi({
  baseQuery: customBaseQuery,
  endpoints: () => ({}),
});
