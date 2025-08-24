import { Button } from "@/components/ui/button";

type Scan = any; // TODO: API 타Rr입으로 교체

type ResultItem = {
  id: number;
  name: string;
  score: string;
  type: "오류 확인" | "진행중" | "대기" | "검사 시작";
  hasIssues?: boolean;
  category?: string;
};

const DEFAULT_ITEMS: ResultItem[] = [
  {
    id: 1,
    name: "적절한 대체 텍스트 제공",
    score: "검사 대기",
    type: "검사 시작",
    category: "alt_text",
  },
  {
    id: 2,
    name: "자막 제공",
    score: "검사 대기",
    type: "검사 시작",
    category: "video",
  },
  {
    id: 3,
    name: "표의 구성",
    score: "검사 대기",
    type: "검사 시작",
    category: "table",
  },
  {
    id: 4,
    name: "자동 재생 금지",
    score: "검사 대기",
    type: "검사 시작",
    category: "video",
  },
  {
    id: 5,
    name: "텍스트 콘텐츠의 명도 대비",
    score: "검사 대기",
    type: "검사 시작",
    category: "contrast",
  },
  {
    id: 6,
    name: "키보드 사용 보장",
    score: "검사 대기",
    type: "검사 시작",
    category: "keyboard",
  },
  {
    id: 7,
    name: "레이블 제공",
    score: "검사 대기",
    type: "검사 시작",
    category: "label",
  },
  {
    id: 8,
    name: "마크업 오류 방지",
    score: "검사 대기",
    type: "검사 시작",
    category: "markup_error",
  },
  {
    id: 9,
    name: "기본 언어 표시",
    score: "검사 대기",
    type: "검사 시작",
    category: "basic_language",
  },
  {
    id: 10,
    name: "제목 제공",
    score: "검사 대기",
    type: "검사 시작",
    category: "heading",
  },
  {
    id: 11,
    name: "응답 시간 조절",
    score: "검사 대기",
    type: "검사 시작",
    category: "response_time",
  },
  {
    id: 12,
    name: "정지 기능 제공",
    score: "검사 대기",
    type: "검사 시작",
    category: "pause_control",
  },
  {
    id: 13,
    name: "깜빡임과 번쩍임 사용 제한",
    score: "검사 대기",
    type: "검사 시작",
    category: "flashing",
  },
];

function buildItems(
  displayScan: Scan | null,
  detail: any | null
): ResultItem[] {
  if (!displayScan) return DEFAULT_ITEMS;

  if (displayScan.status === "pending") {
    return DEFAULT_ITEMS.map((i) => ({
      ...i,
      score: "검사 대기중",
      type: "대기",
    }));
  }

  if (displayScan.status === "processing") {
    const v = detail || {};

    return [
      {
        id: 1,
        name: "적절한 대체 텍스트 제공",
        score: v.alt_text_completed
          ? v.alt_text_results
            ? `${
                v.alt_text_results.filter((r: any) => r.compliance === 0).length
              } / ${v.alt_text_results.length}`
            : "검사 완료"
          : "검사중...",
        type: v.alt_text_completed ? "오류 확인" : "진행중",
        hasIssues: (v.alt_text_results || []).some(
          (r: any) => r.compliance !== 0
        ),
        category: "alt_text",
      },
      {
        id: 2,
        name: "자막 제공",
        score: v.video_completed
          ? v.video_results
            ? `${
                v.video_results.filter((r: any) => r.has_transcript).length
              } / ${v.video_results.length}`
            : "검사 완료"
          : "검사중...",
        type: v.video_completed ? "오류 확인" : "진행중",
        hasIssues: (v.video_results || []).some((r: any) => !r.has_transcript),
        category: "video",
      },
      {
        id: 3,
        name: "표의 구성",
        score: v.table_completed
          ? v.table_results
            ? `${v.table_results.filter((r: any) => r.compliant).length} / ${
                v.table_results.length
              }`
            : "검사 완료"
          : "검사중...",
        type: v.table_completed ? "오류 확인" : "진행중",
        hasIssues: (v.table_results || []).some((r: any) => !r.compliant),
        category: "table",
      },
      {
        id: 4,
        name: "자동 재생 금지",
        score: v.video_completed
          ? v.video_results
            ? `${
                v.video_results.filter((r: any) => r.autoplay_disabled).length
              } / ${v.video_results.length}`
            : "검사 완료"
          : "검사중...",
        type: v.video_completed ? "오류 확인" : "진행중",
        hasIssues: (v.video_results || []).some(
          (r: any) => !r.autoplay_disabled
        ),
        category: "video",
      },
      {
        id: 5,
        name: "텍스트 콘텐츠의 명도 대비",
        score: v.contrast_completed
          ? v.contrast_results
            ? `${
                v.contrast_results.filter((r: any) => r.wcag_compliant).length
              } / ${v.contrast_results.length}`
            : "검사 완료"
          : "검사중...",
        type: v.contrast_completed ? "오류 확인" : "진행중",
        hasIssues: (v.contrast_results || []).some(
          (r: any) => !r.wcag_compliant
        ),
        category: "contrast",
      },
      {
        id: 6,
        name: "키보드 사용 보장",
        score: v.keyboard_completed
          ? v.keyboard_results
            ? `${
                v.keyboard_results.filter((r: any) => r.accessible).length
              } / ${v.keyboard_results.length}`
            : "검사 완료"
          : "검사중...",
        type: v.keyboard_completed ? "오류 확인" : "진행중",
        hasIssues: (v.keyboard_results || []).some((r: any) => !r.accessible),
        category: "keyboard",
      },
      {
        id: 7,
        name: "레이블 제공",
        score: v.label_completed
          ? v.label_results
            ? `${
                v.label_results.filter((r: any) => r.label_present).length
              } / ${v.label_results.length}`
            : "검사 완료"
          : "검사중...",
        type: v.label_completed ? "오류 확인" : "진행중",
        hasIssues: (v.label_results || []).some((r: any) => !r.label_present),
        category: "label",
      },
      {
        id: 8,
        name: "마크업 오류 방지",
        score: v.markup_error_completed
          ? v.markup_error_results
            ? `${
                v.markup_error_results.filter((r: any) => r.compliant).length
              } / ${v.markup_error_results.length}`
            : "검사 완료"
          : "검사중...",
        type: v.markup_error_completed ? "오류 확인" : "진행중",
        hasIssues: (v.markup_error_results || []).some(
          (r: any) => !r.compliant
        ),
        category: "markup_error",
      },
      {
        id: 9,
        name: "기본 언어 표시",
        score: v.basic_language_completed
          ? v.basic_language_results
            ? `${
                v.basic_language_results.filter((r: any) => r.compliant).length
              } / ${v.basic_language_results.length}`
            : "검사 완료"
          : "검사중...",
        type: v.basic_language_completed ? "오류 확인" : "진행중",
        hasIssues: (v.basic_language_results || []).some(
          (r: any) => !r.compliant
        ),
        category: "basic_language",
      },
      {
        id: 10,
        name: "제목 제공",
        score: v.heading_completed
          ? v.heading_results
            ? `${v.heading_results.filter((r: any) => r.compliant).length} / ${
                v.heading_results.length
              }`
            : "검사 완료"
          : "검사중...",
        type: v.heading_completed ? "오류 확인" : "진행중",
        hasIssues: (v.heading_results || []).some((r: any) => !r.compliant),
        category: "heading",
      },
      {
        id: 11,
        name: "응답 시간 조절",
        score: v.response_time_completed
          ? v.response_time_results
            ? `${
                v.response_time_results.filter((r: any) => r.compliant).length
              } / ${v.response_time_results.length}`
            : "검사 완료"
          : "검사중...",
        type: v.response_time_completed ? "오류 확인" : "진행중",
        hasIssues: (v.response_time_results || []).some(
          (r: any) => !r.compliant
        ),
        category: "response_time",
      },
      {
        id: 12,
        name: "정지 기능 제공",
        score: v.pause_control_completed
          ? v.pause_control_results
            ? `${
                v.pause_control_results.filter((r: any) => r.compliant).length
              } / ${v.pause_control_results.length}`
            : "검사 완료"
          : "검사중...",
        type: v.pause_control_completed ? "오류 확인" : "진행중",
        hasIssues: (v.pause_control_results || []).some(
          (r: any) => !r.compliant
        ),
        category: "pause_control",
      },
      {
        id: 13,
        name: "깜빡임과 번쩍임 사용 제한",
        score: v.flashing_completed
          ? v.flashing_results
            ? `${v.flashing_results.filter((r: any) => r.compliant).length} / ${
                v.flashing_results.length
              }`
            : "검사 완료"
          : "검사중...",
        type: v.flashing_completed ? "오류 확인" : "진행중",
        hasIssues: (v.flashing_results || []).some((r: any) => !r.compliant),
        category: "flashing",
      },
    ];
  }

  if (displayScan.status !== "completed" || !detail) return DEFAULT_ITEMS;

  const v = detail;
  return [
    {
      id: 1,
      name: "적절한 대체 텍스트 제공",
      score: v.alt_text_results
        ? `${
            v.alt_text_results.filter((r: any) => r.compliance === 0).length
          } / ${v.alt_text_results.length}`
        : "검사 대기",
      type: "오류 확인",
      hasIssues: (v.alt_text_results || []).some(
        (r: any) => r.compliance !== 0
      ),
      category: "alt_text",
    },
    {
      id: 2,
      name: "자막 제공",
      score: v.video_results
        ? `${v.video_results.filter((r: any) => r.has_transcript).length} / ${
            v.video_results.length
          }`
        : "검사 대기",
      type: "오류 확인",
      hasIssues: (v.video_results || []).some((r: any) => !r.has_transcript),
      category: "video",
    },
    {
      id: 3,
      name: "표의 구성",
      score: v.table_results
        ? `${v.table_results.filter((r: any) => r.compliant).length} / ${
            v.table_results.length
          }`
        : "검사 대기",
      type: "오류 확인",
      hasIssues: (v.table_results || []).some((r: any) => !r.compliant),
      category: "table",
    },
    {
      id: 4,
      name: "자동 재생 금지",
      score: v.video_results
        ? `${
            v.video_results.filter((r: any) => r.autoplay_disabled).length
          } / ${v.video_results.length}`
        : "검사 대기",
      type: "오류 확인",
      hasIssues: (v.video_results || []).some((r: any) => !r.autoplay_disabled),
      category: "video",
    },
    {
      id: 5,
      name: "텍스트 콘텐츠의 명도 대비",
      score: v.contrast_results
        ? `${
            v.contrast_results.filter((r: any) => r.wcag_compliant).length
          } / ${v.contrast_results.length}`
        : "검사 대기",
      type: "오류 확인",
      hasIssues: (v.contrast_results || []).some((r: any) => !r.wcag_compliant),
      category: "contrast",
    },
    {
      id: 6,
      name: "키보드 사용 보장",
      score: v.keyboard_results
        ? `${v.keyboard_results.filter((r: any) => r.accessible).length} / ${
            v.keyboard_results.length
          }`
        : "검사 대기",
      type: "오류 확인",
      hasIssues: (v.keyboard_results || []).some((r: any) => !r.accessible),
      category: "keyboard",
    },
    {
      id: 7,
      name: "레이블 제공",
      score: v.label_results
        ? `${v.label_results.filter((r: any) => r.label_present).length} / ${
            v.label_results.length
          }`
        : "검사 대기",
      type: "오류 확인",
      hasIssues: (v.label_results || []).some((r: any) => !r.label_present),
      category: "label",
    },
    {
      id: 8,
      name: "마크업 오류 방지",
      score: v.markup_error_results
        ? `${v.markup_error_results.filter((r: any) => r.compliant).length} / ${
            v.markup_error_results.length
          }`
        : "검사 대기",
      type: "오류 확인",
      hasIssues: (v.markup_error_results || []).some((r: any) => !r.compliant),
      category: "markup_error",
    },
    {
      id: 9,
      name: "기본 언어 표시",
      score: v.basic_language_results
        ? `${
            v.basic_language_results.filter((r: any) => r.compliant).length
          } / ${v.basic_language_results.length}`
        : "검사 대기",
      type: "오류 확인",
      hasIssues: (v.basic_language_results || []).some(
        (r: any) => !r.compliant
      ),
      category: "basic_language",
    },
    {
      id: 10,
      name: "제목 제공",
      score: v.heading_results
        ? `${v.heading_results.filter((r: any) => r.compliant).length} / ${
            v.heading_results.length
          }`
        : "검사 대기",
      type: "오류 확인",
      hasIssues: (v.heading_results || []).some((r: any) => !r.compliant),
      category: "heading",
    },
    {
      id: 11,
      name: "응답 시간 조절",
      score: v.response_time_results
        ? `${
            v.response_time_results.filter((r: any) => r.compliant).length
          } / ${v.response_time_results.length}`
        : "검사 대기",
      type: "오류 확인",
      hasIssues: (v.response_time_results || []).some((r: any) => !r.compliant),
      category: "response_time",
    },
    {
      id: 12,
      name: "정지 기능 제공",
      score: v.pause_control_results
        ? `${
            v.pause_control_results.filter((r: any) => r.compliant).length
          } / ${v.pause_control_results.length}`
        : "검사 대기",
      type: "오류 확인",
      hasIssues: (v.pause_control_results || []).some((r: any) => !r.compliant),
      category: "pause_control",
    },
    {
      id: 13,
      name: "깜빡임과 번쩍임 사용 제한",
      score: v.flashing_results
        ? `${v.flashing_results.filter((r: any) => r.compliant).length} / ${
            v.flashing_results.length
          }`
        : "검사 대기",
      type: "오류 확인",
      hasIssues: (v.flashing_results || []).some((r: any) => !r.compliant),
      category: "flashing",
    },
  ];
}

export const ResultTable = ({
  displayScan,
  isDisplayingScanDetail,
  selectedScanDetail,
  onNavigate,
}: {
  displayScan: Scan | null;
  isDisplayingScanDetail: boolean;
  selectedScanDetail: any | null;
  onNavigate: (path: string) => void;
}) => {
  const rows = buildItems(
    displayScan,
    isDisplayingScanDetail ? selectedScanDetail : null
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-center min-w-[600px]">
        <thead>
          <tr className="border-b">
            <th className="w-16 p-2">순번</th>
            <th className="p-2 text-left min-w-[100px]">항목</th>
            <th className="w-24 p-2">준수율</th>
            <th className="w-24 p-2">오류 확인</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => (
            <tr key={item.id} className="border-b">
              <td className="p-2">{item.id}</td>
              <td className="p-2 text-left">
                <span className="break-words">{item.name}</span>
              </td>
              <td className="p-2">
                <span className="break-words">{item.score}</span>
              </td>
              <td className="p-2">
                <Button
                  size="sm"
                  variant="outline"
                  className={`${
                    item.type === "진행중"
                      ? "bg-yellow-500 text-white"
                      : item.type === "대기"
                      ? "bg-gray-400 text-white"
                      : "bg-[#6C9AFF] text-white"
                  } whitespace-nowrap`}
                  disabled={
                    !displayScan ||
                    (displayScan.status !== "completed" &&
                      item.type !== "진행중") ||
                    item.type === "대기"
                  }
                  onClick={() => {
                    if (
                      displayScan &&
                      displayScan.status === "completed" &&
                      item.category
                    ) {
                      onNavigate(`/scan/${displayScan.id}/${item.category}`);
                    }
                  }}
                >
                  {item.type}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
