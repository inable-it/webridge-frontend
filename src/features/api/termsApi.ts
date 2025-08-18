import { privateApi } from "@/app/api";

type TermsStatus = {
  needs_update: boolean;
  user_agreements: {
    service_terms: boolean;
    privacy_policy: boolean;
    marketing: boolean;
  };
  user_versions?: Record<string, string>;
  current_versions?: Record<string, string>;
};

type UpdateTermsBody = {
  service_terms_agreed: boolean;
  privacy_policy_agreed: boolean;
  marketing_agreed: boolean;
};

export const termsApi = privateApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1) 사용자의 약관 동의 상태 조회
    getTermsStatus: builder.query<TermsStatus, void>({
      query: () => "/terms/status/",
    }),

    // 2) 약관 재동의 (이번 요구사항은 marketing 만 토글)
    updateTermsAgreement: builder.mutation<
      { success?: boolean; message?: string },
      UpdateTermsBody
    >({
      query: (body) => ({
        url: "/terms/update/",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useGetTermsStatusQuery, useUpdateTermsAgreementMutation } =
  termsApi;
