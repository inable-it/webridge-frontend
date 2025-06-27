import {privateApi} from "@/app/api.ts";
import type {User} from "@/types/user.ts";

export const userApi = privateApi.injectEndpoints({
    endpoints: (builder) => ({
        getMyInfo: builder.query<{ success: boolean; message: string; data: User }, void>({
            query: () => "/user/me", // API 요청 경로
        }),
    }),

})
export const {useGetMyInfoQuery} = userApi;