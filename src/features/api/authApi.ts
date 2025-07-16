import { publicApi } from "@/app/api";
import type { LoginResponse } from "@/types/user.ts";

// 회원가입 요청 타입 정의
type RegisterRequest = {
  email: string;
  password: string;
  password2: string;
  name: string;
  terms_agreed: boolean;
};

type LoginRequest = {
  email: string;
  password: string;
};

type SocialLoginRequest = {
  provider: string;
  access_token: string;
};

type LogoutRequest = {
  refresh: string;
};

// 인증이 필요 없는 API들: 회원가입, 로그인, 소셜 로그인, 로그아웃
export const authPublicApi = publicApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<LoginResponse, RegisterRequest>({
      query: (body) => ({
        url: "auth/register/",
        method: "POST",
        body,
      }),
    }),

    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({
        url: "auth/login/",
        method: "POST",
        body,
      }),
    }),

    socialLogin: builder.mutation<LoginResponse, SocialLoginRequest>({
      query: (body) => ({
        url: "auth/social-login/",
        method: "POST",
        body,
      }),
    }),

    logout: builder.mutation<void, LogoutRequest>({
      query: (body) => ({
        url: "auth/logout/",
        method: "POST",
        body,
      }),
    }),
  }),
  overrideExisting: false,
});

// export 정리
export const {
  useRegisterMutation,
  useLoginMutation,
  useSocialLoginMutation,
  useLogoutMutation,
} = authPublicApi;
