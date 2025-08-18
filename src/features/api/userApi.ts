import { privateApi } from "@/app/api";
import type { User } from "@/types/user";

type ApiResp<T> = { success: boolean; message: string; data: T };

export const userApi = privateApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyInfo: builder.query<ApiResp<User>, void>({
      query: () => "/user/me",
    }),

    // name, password 둘 다 이 엔드포인트로 패치
    updateMyProfile: builder.mutation<
      ApiResp<User>,
      Partial<{ name: string; password: string }>
    >({
      query: (body) => ({
        url: "/user/me",
        method: "PATCH",
        body,
      }),
    }),

    deleteUserAccount: builder.mutation<void, void>({
      query: () => ({
        url: "/user/me",
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetMyInfoQuery,
  useUpdateMyProfileMutation,
  useDeleteUserAccountMutation,
} = userApi;
