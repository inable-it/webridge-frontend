import { privateApi } from "@/app/api";

export type SurveyPayload = {
  email: string;
  privacy_agreed: boolean;

  // Q1 회사 유형 (복수선택 → 배열)
  company_type: string[];
  company_type_other?: string;

  // Q2 사용 이유 (복수선택 → 배열)
  usage_reason: string[];
  usage_reason_other?: string;

  // Q3 만족도 (각 1~5)
  satisfaction_overall: 1 | 2 | 3 | 4 | 5;
  satisfaction_accuracy: 1 | 2 | 3 | 4 | 5;
  satisfaction_reuse: 1 | 2 | 3 | 4 | 5;
  satisfaction_recommend: 1 | 2 | 3 | 4 | 5;

  // Q4 구매 방식 (단일)
  user_type?: string;
  user_type_other?: string;

  // Q5 이용료 형태 (단일)
  purchase_method: string;
  purchase_method_other?: string;

  // Q6 이용 방식 (복수선택 → 배열)
  usage_method: string[];
  usage_method_other?: string;

  // Q7 추가 희망 기능 (복수선택 → 배열)
  future_feature: string[];
  future_feature_other?: string;

  // Q8 자유 의견
  improvement_opinion?: string;
};

// 설문 트리거 응답 타입
export type SurveyTriggerResponse = {
  completed_scans_count: number;
  has_issues_found: boolean;
  survey_shown: boolean;
  survey_completed: boolean;
  should_show_survey: boolean;
};

// (선택) 생성 응답 타입 – 백엔드 스키마에 맞게 필요 시 보완
export type SurveyCreateResponse = {
  ok?: true;
  id?: string;
  created_at?: string;
};

export const surveyApi = privateApi.injectEndpoints({
  endpoints: (builder) => ({
    createSurvey: builder.mutation<SurveyCreateResponse, SurveyPayload>({
      query: (body) => ({
        url: "survey/create/",
        method: "POST",
        body,
      }),
      // 설문 제출 후 트리거 상태 다시 쓰도록 캐시 무효화(선택)
      invalidatesTags: ["SurveyTrigger"] as any,
    }),

    // 설문 표시 여부 체크
    getSurveyTrigger: builder.query<SurveyTriggerResponse, void>({
      query: () => ({ url: "survey/check-trigger/" }),
      providesTags: ["SurveyTrigger"] as any,
    }),

    // 설문 “표시함” 기록 (다시 뜨지 않게)
    markSurveyShown: builder.mutation<{ ok: true }, void>({
      query: () => ({
        url: "survey/mark-shown/",
        method: "POST",
      }),
      invalidatesTags: ["SurveyTrigger"] as any,
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateSurveyMutation,
  useGetSurveyTriggerQuery,
  useMarkSurveyShownMutation,
} = surveyApi;
