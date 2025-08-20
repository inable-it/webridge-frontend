import { privateApi } from "@/app/api";

export type SurveyPayload = {
  email: string;
  privacy_agreed: boolean;

  // Q1 회사 유형 (복수선택 → 'a,b,c' 형식)
  company_type: string; // e.g. "a,b,f"
  company_type_other?: string;

  // Q2 사용 이유 (복수선택 → 'a,b,c' 형식)
  usage_reason: string; // e.g. "a,c,f"; 기타 텍스트는 서버 스키마상 별도 필드가 없어서 문자열에 덧붙이지 않도록 함(필요 시 서버와 합의)

  // Q3 만족도 (각 1~5)
  satisfaction_overall: number;
  satisfaction_accuracy: number;
  satisfaction_reuse: number;
  satisfaction_recommend: number;

  // Q4 구매 방식 (단일선택)
  user_type?: string; // 스키마에 존재(선택사항). 필요 시 사용
  user_type_other?: string;

  // Q5 이용료 형태 (단일선택)
  purchase_method: string; // e.g. "a"
  purchase_method_other?: string;

  // Q6 이용 방식 (복수선택)
  usage_method: string; // e.g. "a,c,f"
  usage_method_other?: string;

  // Q7 추가 희망 기능 (복수선택)
  future_feature: string; // e.g. "a,d,f"
  future_feature_other?: string;

  // Q8 자유 의견
  improvement_opinion?: string;
};

export const surveyApi = privateApi.injectEndpoints({
  endpoints: (builder) => ({
    createSurvey: builder.mutation<any, SurveyPayload>({
      query: (body) => ({
        url: "survey/create/",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useCreateSurveyMutation } = surveyApi;
