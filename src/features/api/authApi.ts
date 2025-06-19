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

interface SocialLoginResponse {
  access: string; // access token
  refresh: string; // refresh token
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
  }),
});

export const { useRegisterMutation, useSocialLoginMutation } = authApi;
