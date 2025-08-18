import { privateApi } from "@/app/api";

type CreateExtraInfoReq = {
  path_to_webridge: string; // 선택값 (예: 'SNS', '기타' 등)
  path_to_webridge_other?: string; // '기타'일 때만 채움
  occupation: string; // 선택값 (예: 'PM/PO', '기타' 등)
  occupation_other?: string; // '기타'일 때만 채움
};
type CreateExtraInfoRes = {
  path_to_webridge: string; // 선택값 (예: 'SNS', '기타' 등)
  path_to_webridge_other?: string; // '기타'일 때만 채움
  occupation: string; // 선택값 (예: 'PM/PO', '기타' 등)
  occupation_other?: string; // '기타'일 때만 채움
};
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
