import { privateApi } from "@/app/api";

export type AltTextFeedbackRating = "like" | "dislike";

export interface AltTextFeedbackPayload {
  alt_text_result: number; // 결과 ID
  rating: AltTextFeedbackRating; // "like" | "dislike"
}

export interface AltTextFeedback {
  id: number;
  alt_text_result: number;
  rating: AltTextFeedbackRating;
  created_at: string; // ISO8601
}

export const altTextFeedbackApi = privateApi.injectEndpoints({
  endpoints: (builder) => ({
    /** 생성/업데이트(서버가 기존 평가가 있으면 업데이트 처리) */
    createAltTextFeedback: builder.mutation<
      AltTextFeedback,
      AltTextFeedbackPayload
    >({
      query: (body) => ({
        url: "/alt-text-feedback/create/",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useCreateAltTextFeedbackMutation } = altTextFeedbackApi;
