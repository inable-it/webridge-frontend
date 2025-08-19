import { privateApi } from "@/app/api";

export type CreateExtraInfoReq = {
  path_to_webridge: string; // "a" ~ "f"
  path_to_webridge_other?: string; // f(기타)일 때만
  occupation: string; // "a" ~ "f"
  occupation_other?: string; // f(기타)일 때만
};
export type CreateExtraInfoRes = CreateExtraInfoReq;

export const extraInfoApi = privateApi.injectEndpoints({
  endpoints: (builder) => ({
    createUserExtraInfo: builder.mutation<
      CreateExtraInfoRes,
      CreateExtraInfoReq
    >({
      query: (body) => ({
        url: "/user/extra-info/",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useCreateUserExtraInfoMutation } = extraInfoApi;
