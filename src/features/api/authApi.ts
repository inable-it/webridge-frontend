import { baseApi } from "@/app/api";

interface RegisterRequest {
  email: string;
  password: string;
  password2: string;
  name: string;
}

interface RegisterResponse {
  id: number;
  email: string;
  name: string;
  profile_image: string;
  provider: string;
  created_at: string;
}

interface SocialLoginRequest {
  provider: "google";
  access_token: string;
}

interface User {
  id: number;
  email: string;
  name: string;
  profile_image: string;
  provider: string;
  created_at: string;
}

interface SocialLoginResponse {
  user: User;
  access: string;
  refresh: string;
  is_new: boolean;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  user: User;
  access: string;
  refresh: string;
  is_new: boolean;
}

interface LogoutRequest {
  refresh: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (body) => ({
        url: "auth/register/",
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
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({
        url: "auth/login/",
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
});

export const {
  useRegisterMutation,
  useSocialLoginMutation,
  useLoginMutation,
  useLogoutMutation,
} = authApi;
