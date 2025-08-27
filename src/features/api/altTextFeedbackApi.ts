import { privateApi } from "@/app/api";

export type AltTextFeedbackRating = "like" | "dislike";

export interface AltTextFeedbackPayload {
  alt_text_result: number;
  rating: AltTextFeedbackRating;
}

export interface AltTextFeedback {
  id: number;
  alt_text_result: number;
  rating: AltTextFeedbackRating;
  created_at: string;
}

export const altTextFeedbackApi = privateApi.injectEndpoints({
  endpoints: (builder) => ({
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

    // 삭제(토글 해제) 추가
    deleteAltTextFeedback: builder.mutation<void, number>({
      query: (feedbackId) => ({
        url: `/alt-text-feedback/${feedbackId}/delete/`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useCreateAltTextFeedbackMutation,
  useDeleteAltTextFeedbackMutation,
} = altTextFeedbackApi;
