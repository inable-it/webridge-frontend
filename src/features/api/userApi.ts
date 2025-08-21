import { privateApi } from "@/app/api";
import type { User } from "@/types/user";

type ApiResp<T> = { success: boolean; message: string; data: T };

export const userApi = privateApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyInfo: builder.query<ApiResp<User>, void>({
      query: () => "/user/me",
    }),

    updateMyName: builder.mutation<ApiResp<User>, Partial<{ name: string }>>({
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
  useUpdateMyNameMutation,
  useDeleteUserAccountMutation,
} = userApi;
