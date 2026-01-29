import { scanPrivateApi } from '@/app/api';

// 스캔 생성 요청 타입
export type CreateScanRequest = {
  url: string;
};

// 스캔 상태 타입
export type ScanStatus = 'pending' | 'processing' | 'completed' | 'failed';

// 개별 검사 결과 타입들
export type AltTextResult = {
  id: number;
  img_url: string;
  element_html: string;
  alt_text: string;
  answer: string; // AI 평가결과 또는 개선제안
  compliance: 0 | 1 | 2 | 3; // 0=매우높음, 1=조금높음, 2=미준수, 3=시스템오류
  ai_type?: string; // 정보성/기능성/장식적/복합적/알수없음
  ai_grade?: string; // 매우높음/조금높음/미준수/매우낮음
  ai_reason?: string; // AI평가근거
  ai_improvement?: string; // 개선된 대체텍스트
  has_error: boolean; // 처리 실패 여부
  suggested_alt: string; // 기존 호환성 유지
  compliance_display: string; // 기존 호환성 유지
  created_at: string;
  user_feedback: string;
  has_ai_suggestion: boolean;
};

export type ContrastResult = {
  id: number;
  text_content: string;
  element_html: string;
  foreground_color: string;
  background_color: string;
  contrast_ratio: number;
  wcag_compliant: boolean;
  created_at: string;
};

export type KeyboardResult = {
  id: number;
  element_type: string;
  element_html: string;
  accessible: boolean;
  message: string;
  created_at: string;
};

export type LabelResult = {
  id: number;
  input_type: string;
  element_html: string;
  label_present: boolean;
  message: string;
  created_at: string;
};

export type TableResult = {
  id: number;
  headers_count: number;
  rows_count: number;
  element_html: string;
  compliant: boolean;
  message: string;
  created_at: string;
};

/**
 * 비디오 결과 하위 호환 타입
 * - 자막 관련(`video_caption_results`)과 자동재생 관련(`video_autoplay_results`)
 *   응답을 모두 수용할 수 있도록 필드들을 선택적(optional)로 두었습니다.
 */

export type VideoAutoPlayResult = {
  id: number;
  video_url: string;
  element_html: string;
  autoplay_disabled: boolean;
  keyboard_accessible: boolean;
  compliant: boolean;
  message: string;
  created_at: string;
};

export type VideoResult = {
  id: number;
  video_url: string;
  element_html: string;
  has_thumbnail?: boolean;

  // 자막/대본/오디오설명/라벨 등 캡션 관련
  has_transcript?: boolean;
  has_audio_description?: boolean;
  has_aria_label?: boolean;
  compliant: boolean;
  message: string;

  created_at: string;
};

export type BasicLanguageResult = {
  id: number;
  lang_attribute: string;
  compliant: boolean;
  element_html: string;
  message: string;
  created_at: string;
};

export type MarkupErrorResult = {
  id: number;
  total_errors: number;
  error_details: {
    type: string;
    message: string;
    line: number;
  }[];
  element_html: string;
  compliant: boolean;
  message: string;
  created_at: string;
};

export type HeadingResult = {
  id: number;
  // 페이지 제목 관련
  page_title_exists: boolean;
  page_title_empty: boolean;
  page_title_text: string;
  page_title_length: number;
  page_title_compliant: boolean;
  // 팝업/iframe 제목 관련
  total_popups: number;
  popups_without_title: number;
  popup_frames_compliant: boolean;
  // 프레임 제목 관련
  total_frames: number;
  frames_without_title: number;
  // 콘텐츠 블록 제목 관련
  total_headings: number;
  empty_headings: number;
  headings_without_content: number;
  total_semantic_sections: number;
  sections_without_headings: number;
  content_headings_compliant: boolean;
  // 특수 기호 사용 제한
  special_symbol_issues: number;
  special_symbols_compliant: boolean;
  // 전체 결과
  total_issues: number;
  issues_details: string[];
  element_html: string;
  compliant: boolean;
  message: string;
  detailed_results: Record<string, unknown>;
  created_at: string;
};

export type ResponseTimeResult = {
  id: number;
  has_time_limit: boolean;
  short_timeouts: number;
  element_html: string;
  compliant: boolean;
  message: string;
  created_at: string;
};

export type PauseControlResult = {
  id: number;
  auto_elements_found: number;
  elements_without_pause: number;
  element_html: string;
  compliant: boolean;
  message: string;
  created_at: string;
};

export type FlashingResult = {
  id: number;
  flashing_elements_count: number;
  has_flashing_script: boolean;
  issue_details: string[];
  element_html: string;
  compliant: boolean;
  message: string;
  created_at: string;
};

// 리포트 타입
export type ScanReport = {
  format: 'pdf' | 'excel' | 'json';
  generated_at: string;
  download_count: number;
  download_url: string | null;
};

// 스캔 요약 정보 타입
export type ScanSummaryItem = {
  rank: number;
  category: string;
  compliance_rate: string;
  compliance_percentage: number;
  error_type: string;
};

// 스캔 목록용 응답 타입
export type AccessibilityScanListItem = {
  id: string;
  url: string;
  title: string;
  status: ScanStatus;
  status_display: string;
  total_issues: number;
  compliance_score: number;
  completion_percentage: number;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
};

// 스캔 상세 정보 응답 타입 (실제 API 스키마 반영)
export type AccessibilityScanDetail = {
  id: string;
  url: string;
  title: string;
  status: ScanStatus;
  status_display: string;
  progress: number;
  total_issues: number;
  compliance_score: number;
  completion_percentage: number;

  // 각 검사별 완료 상태
  alt_text_completed: boolean;
  contrast_completed: boolean;
  keyboard_completed: boolean;
  label_completed: boolean;
  table_completed: boolean;

  // 비디오가 자막/자동재생으로 분리됨
  video_caption_completed: boolean;
  video_autoplay_completed: boolean;

  basic_language_completed: boolean;
  markup_error_completed: boolean;
  heading_completed: boolean;
  response_time_completed: boolean;
  pause_control_completed: boolean;
  flashing_completed: boolean;

  created_at: string;
  updated_at: string;
  completed_at: string | null;
  error_message: string | null;

  // 각 검사 결과들
  alt_text_results: AltTextResult[];
  contrast_results: ContrastResult[];
  keyboard_results: KeyboardResult[];
  label_results: LabelResult[];
  table_results: TableResult[];

  // 분리된 비디오 결과 배열
  video_caption_results: VideoResult[];
  video_autoplay_results: VideoAutoPlayResult[];

  basic_language_results: BasicLanguageResult[];
  markup_error_results: MarkupErrorResult[];
  heading_results: HeadingResult[];
  response_time_results: ResponseTimeResult[];
  pause_control_results: PauseControlResult[];
  flashing_results: FlashingResult[];

  // 리포트 정보
  report: ScanReport | null;

  // 스캔 요약
  scan_summary: ScanSummaryItem[];
};

// 스캔 생성 응답 타입
export type CreateScanResponse = {
  scan: AccessibilityScanDetail;
  task_id: string;
  message: string;
};

// 스캔 목록 응답 타입 (페이지네이션)
export type ScanListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: AccessibilityScanListItem[];
};

// 스캔 진행 상황 타입
export type ScanProgress = {
  scan_id: string;
  status: ScanStatus;
  progress: number;
  current_test?: string;
  message?: string;
  timestamp?: string;
  type?: 'initial' | 'progress' | 'error' | 'fatal_error';
  final?: boolean;
  error?: string;
};

// 리포트 생성 요청/응답 타입
export type GenerateReportRequest = {
  format: 'pdf' | 'excel' | 'json';
};
export type GenerateReportResponse = {
  task_id: string;
  message: string;
  format: string;
};

// 스캔 재시작 응답 타입
export type RestartScanResponse = {
  scan: AccessibilityScanDetail;
  task_id: string;
  message: string;
};

// 스캔 API
export const scanApi = scanPrivateApi.injectEndpoints({
  endpoints: (builder) => ({
    createScan: builder.mutation<CreateScanResponse, CreateScanRequest>({
      query: (body) => ({
        url: 'scans/create/',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Scan', id: 'LIST' }],
    }),

    getScanList: builder.query<
      ScanListResponse,
      { status?: ScanStatus; ordering?: string; page?: number; page_size?: number }
    >({
      query: ({ status, ordering = '-created_at', page = 1, page_size = 10 } = {}) => {
        const params = new URLSearchParams({
          ordering,
          page: page.toString(),
          page_size: page_size.toString(),
        });
        if (status) params.append('status', status);
        return { url: `scans/?${params.toString()}` };
      },
      providesTags: (result) =>
        result
          ? [...result.results.map(({ id }) => ({ type: 'Scan' as const, id })), { type: 'Scan', id: 'LIST' }]
          : [{ type: 'Scan', id: 'LIST' }],
    }),

    getScanDetail: builder.query<AccessibilityScanDetail, string>({
      query: (scanId) => ({ url: `scans/${scanId}/` }),
      providesTags: (_result, _error, scanId) => [{ type: 'Scan', id: scanId }],
    }),

    deleteScan: builder.mutation<void, string>({
      query: (scanId) => ({
        url: `scans/${scanId}/delete/`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, scanId) => [
        { type: 'Scan', id: 'LIST' },
        { type: 'Scan', id: scanId },
      ],
    }),

    getScanProgress: builder.query<ScanProgress, string>({
      query: (scanId) => ({ url: `scans/${scanId}/progress/` }),
    }),

    generateReport: builder.mutation<GenerateReportResponse, { scanId: string; data: GenerateReportRequest }>({
      query: ({ scanId, data }) => ({
        url: `scans/${scanId}/generate-report/`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { scanId }) => [{ type: 'Scan', id: scanId }],
    }),

    getReportDownloadUrl: builder.query<{ download_url: string }, string>({
      query: (scanId) => ({ url: `scans/${scanId}/download-report/` }),
    }),

    restartScan: builder.mutation<RestartScanResponse, string>({
      query: (scanId) => ({
        url: `scans/${scanId}/restart/`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, scanId) => [
        { type: 'Scan', id: 'LIST' },
        { type: 'Scan', id: scanId },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateScanMutation,
  useGetScanListQuery,
  useGetScanDetailQuery,
  useDeleteScanMutation,
  useGetScanProgressQuery,
  useGenerateReportMutation,
  useGetReportDownloadUrlQuery,
  useRestartScanMutation,
} = scanApi;
