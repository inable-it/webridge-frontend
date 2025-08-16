import { privateApi } from "@/app/api";

// 피드백 관련 타입 정의
export type CreateFeedbackRequest = {
  content: string;
  rating: number;
};

export type UpdateFeedbackRequest = {
  content: string;
  rating: number;
};

export type FeedbackResponse = {
  id: number;
  content: string;
  rating: number;
  created_at: string;
  updated_at: string;
};

export type FeedbackListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: FeedbackResponse[];
};

export type CreateFeedbackResponse = {
  content: string;
  rating: number;
};

// 피드백 API
export const feedbackApi = privateApi.injectEndpoints({
  endpoints: (builder) => ({
    // 피드백 생성
    createFeedback: builder.mutation<
      CreateFeedbackResponse,
      CreateFeedbackRequest
    >({
      query: (body) => ({
        url: "feedback/create/",
        method: "POST",
        body,
      }),
    }),

    // 피드백 목록 조회
    getFeedbackList: builder.query<
      FeedbackListResponse,
      { page?: number; page_size?: number }
    >({
      query: ({ page = 1, page_size = 20 } = {}) => ({
        url: "feedback/list/",
        params: { page, page_size },
      }),
    }),

    // 피드백 수정
    updateFeedback: builder.mutation<
      FeedbackResponse,
      { id: number; data: UpdateFeedbackRequest }
    >({
      query: ({ id, data }) => ({
        url: `feedback/${id}/update/`,
        method: "PATCH",
        body: data,
      }),
    }),

    // 피드백 삭제
    deleteFeedback: builder.mutation<void, number>({
      query: (id) => ({
        url: `feedback/${id}/delete/`,
        method: "DELETE",
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateFeedbackMutation,
  useGetFeedbackListQuery,
  useUpdateFeedbackMutation,
  useDeleteFeedbackMutation,
} = feedbackApi;
