import { publicApi, privateApi } from "@/app/api";
import type {LoginResponse} from "@/types/user.ts";



// public 인증 API (로그인/회원가입/소셜로그인만)
export const authPublicApi = publicApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<
      LoginResponse,
      { email: string; password: string; password2: string; name: string }
    >({
      query: (body) => ({ url: "auth/register/", method: "POST", body }),
    }),
    login: builder.mutation<LoginResponse, { email: string; password: string }>(
      {
        query: (body) => ({ url: "auth/login/", method: "POST", body }),
      }
    ),
    socialLogin: builder.mutation<
      LoginResponse,
      { provider: string; access_token: string }
    >({
      query: (body) => ({ url: "auth/social-login/", method: "POST", body }),
    }),
  }),
  overrideExisting: false,
});

// private 인증 API (로그아웃은 보호 API)
export const authPrivateApi = privateApi.injectEndpoints({
  endpoints: (builder) => ({
    logout: builder.mutation<void, { refresh: string }>({
      query: (body) => ({ url: "auth/logout/", method: "POST", body }),
    }),
  }),
  overrideExisting: false,
});

export const { useRegisterMutation, useLoginMutation, useSocialLoginMutation } =
  authPublicApi;

export const { useLogoutMutation } = authPrivateApi;
