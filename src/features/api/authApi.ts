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

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (body) => ({
        url: "auth/register/",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useRegisterMutation } = authApi;
