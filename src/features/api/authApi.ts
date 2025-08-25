import { publicApi, privateApi } from "@/app/api";
import type {
  LoginResponse,
  SocialLoginResponse,
  SocialTermsAgreementResponse,
} from "@/types/user.ts";

// 회원가입 요청 타입 정의 (API 명세에 맞춰 수정)
type RegisterRequest = {
  email: string;
  password: string;
  password2: string;
  name: string;
  service_terms_agreed: boolean;
  age_verification_agreed: boolean;
  privacy_policy_agreed: boolean;
  marketing_agreed: boolean;
};

type LoginRequest = {
  email: string;
  password: string;
};

type SocialLoginRequest = {
  provider: string;
  access_token: string;
};

type SocialTermsAgreementRequest = {
  service_terms_agreed: boolean;
  age_verification_agreed: boolean;
  privacy_policy_agreed: boolean;
  marketing_agreed: boolean;
};

type LogoutRequest = {
  refresh: string;
};

type PasswordResetRequest = {
  email: string;
};

type PasswordResetConfirmRequest = {
  uid: string;
  token: string;
  new_password: string;
  new_password2: string;
};

type EmailVerificationRequest = {
  email: string;
};

type EmailVerificationResponse = {
  message: string;
};

type PasswordResetResponse = {
  message: string;
};

type PasswordResetConfirmResponse = {
  message: string;
};

type ChangePasswordRequest = {
  new_password: string;
};

type ChangePasswordResponse = {
  message: string;
};

// 인증이 필요 없는 Public API들: 회원가입, 로그인, 소셜 로그인, 로그아웃, 비밀번호 재설정, 이메일 인증
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

    socialLogin: builder.mutation<SocialLoginResponse, SocialLoginRequest>({
      query: (body) => ({
        url: "auth/social-login/",
        method: "POST",
        body,
      }),
    }),

    passwordReset: builder.mutation<
      PasswordResetResponse,
      PasswordResetRequest
    >({
      query: (body) => ({
        url: "auth/password-reset/",
        method: "POST",
        body,
      }),
    }),

    passwordResetConfirm: builder.mutation<
      PasswordResetConfirmResponse,
      PasswordResetConfirmRequest
    >({
      query: (body) => ({
        url: "auth/password-reset-confirm/",
        method: "POST",
        body,
      }),
    }),

    // 이메일 인증 요청
    requestEmailVerification: builder.mutation<
      EmailVerificationResponse,
      EmailVerificationRequest
    >({
      query: (body) => ({
        url: "auth/request-email-verification/",
        method: "POST",
        body,
      }),
    }),

    // 이메일 인증 상태 확인
    checkEmailVerification: builder.mutation<
      EmailVerificationResponse,
      EmailVerificationRequest
    >({
      query: (body) => ({
        url: "auth/check-email-verification/",
        method: "POST",
        body,
      }),
    }),
  }),
  overrideExisting: false,
});

// 인증이 필요한 Private API들: 소셜 로그인 후 약관 동의 등
export const authPrivateApi = privateApi.injectEndpoints({
  endpoints: (builder) => ({
      logout: builder.mutation<void, LogoutRequest>({
          query: (body) => ({
              url: "auth/logout/",
              method: "POST",
              body,
          }),
      }),
      // 소셜 로그인 후 약관 동의 API - 인증 필요
    socialTermsAgreement: builder.mutation<
      SocialTermsAgreementResponse,
      SocialTermsAgreementRequest
    >({
      query: (body) => ({
        url: "auth/social-terms-agreement/",
        method: "POST",
        body,
      }),
    }),
    changePassword: builder.mutation<
      ChangePasswordResponse,
      ChangePasswordRequest
    >({
      query: (body) => ({
        url: "auth/change-password/",
        method: "POST",
        body,
      }),
    }),
  }),
  overrideExisting: false,
});

// Public API exports
export const {
  useRegisterMutation,
  useLoginMutation,
  useSocialLoginMutation,
  usePasswordResetMutation,
  usePasswordResetConfirmMutation,
  useRequestEmailVerificationMutation,
  useCheckEmailVerificationMutation,
} = authPublicApi;

// Private API exports
export const { useLogoutMutation, useSocialTermsAgreementMutation, useChangePasswordMutation } =
  authPrivateApi;
