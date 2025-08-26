import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";

type Scan = any; // TODO: API 타입으로 교체

type ResultItem = {
  id: number;
  name: string;
  score: string;
  type: "오류 확인" | "진행중" | "대기" | "검사 시작";
  hasIssues?: boolean;
  category?: string;
};

const EXPLANATION_TEXT: Record<number, string> = {
  1: "이미지에 대체 텍스트가 있으면 화면을 보지 못해도 내용을 이해할 수 있어요.",
  2: "영상에 자막/대체 텍스트가 있으면 소리를 듣기 어려운 사용자도 내용을 이해할 수 있어요.",
  3: "표의 헤더와 구조를 올바르게 마크업하면 화면낭독기가 표의 의미를 정확히 전달할 수 있어요.",
  4: "영상/오디오가 자동 재생되면 보조기기 사용에 방해가 될 수 있어요. 재생은 사용자가 제어해야 해요.",
  5: "문자와 배경의 색 대비가 충분해야 저시력 사용자도 내용을 읽을 수 있어요.",
  6: "모든 기능은 키보드만으로도 접근/조작 가능해야 해요. 마우스를 쓰기 어려운 분들도 사용하니까요.",
  7: "입력 요소에는 시각적/프로그램적으로 연결된 레이블이 있어야 의미가 정확히 전달돼요.",
  8: "닫히지 않은 태그나 잘못된 중첩 등 마크업 오류는 보조기기의 해석을 방해할 수 있어요.",
  9: "페이지의 기본 언어를 지정하면 화면낭독기가 정확한 발음/억양으로 읽을 수 있어요.",
  10: "적절한 제목 구조는 사용자와 보조기기가 페이지를 빠르게 탐색하도록 도와줘요.",
  11: "시간 제한이 있으면 연장·일시정지 등 조절 수단을 제공해야 누구나 사용 가능해요.",
  12: "움직이거나 자동 갱신되는 콘텐츠는 정지/일시정지/숨김을 제공해야 해요.",
  13: "초당 3~50회 깜빡임은 발작 유발 위험이 있어 제한해야 해요.",
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
    // ... (완료 시 분기 기존 로직 그대로)
    ...DEFAULT_ITEMS.map((base) => {
      const key = `${base.category}_results`;
      const res = v[key];
      let score = "검사 대기";
      let hasIssues = false;

      if (Array.isArray(res)) {
        if (base.category === "alt_text") {
          score = `${res.filter((r: any) => r.compliance === 0).length} / ${
            res.length
          }`;
          hasIssues = res.some((r: any) => r.compliance !== 0);
        } else if (base.category === "video") {
          score = `${
            res.filter((r: any) => r.has_transcript ?? r.autoplay_disabled)
              .length
          } / ${res.length}`;
          hasIssues = res.some(
            (r: any) => !(r.has_transcript ?? r.autoplay_disabled)
          );
        } else {
          score = `${res.filter((r: any) => r.compliant).length} / ${
            res.length
          }`;
          hasIssues = res.some((r: any) => !r.compliant);
        }
      }

      return { ...base, score, hasIssues, type: "오류 확인" as const };
    }),
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

  const onItemClick = (item: ResultItem) => {
    if (displayScan && displayScan.status === "completed" && item.category) {
      onNavigate(`/scan/${displayScan.id}/${item.category}`);
    }
  };

  return (
    <div className="w-full">
      {/* 데스크톱 테이블: md 이상에서만 노출 */}
      <div
        role="region"
        aria-label="요약 보고서 테이블"
        className="hidden w-full overflow-x-auto md:block"
      >
        <table className="w-full min-w-full text-sm text-center table-fixed">
          <colgroup>
            <col className="w-16" />
            <col className="w-[32%]" />
            <col className="w-28" />
            <col className="w-24" />
            <col className="w-24" />
          </colgroup>
          <thead>
            <tr className="border-b">
              <th className="p-2">순번</th>
              <th className="p-2 text-left">항목</th>
              <th className="p-2">항목 설명</th>
              <th className="p-2">준수율</th>
              <th className="p-2">오류 확인</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => (
              <tr key={item.id} className="align-top border-b">
                <td className="p-2">{item.id}</td>
                <td className="p-2 text-left">
                  <span className="break-words break-all">{item.name}</span>
                </td>
                <td className="p-2">
                  <HoverCard openDelay={100} closeDelay={60}>
                    <HoverCardTrigger asChild>
                      <Button
                        aria-label={`${item.name} 항목 설명`}
                        variant="ghost"
                        size="icon"
                        className="rounded-full"
                      >
                        <Info className="w-4 h-4 text-blue-600" />
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent
                      align="start"
                      className="p-4 space-y-2 text-gray-800 bg-white border border-gray-200 shadow-xl w-80 rounded-xl dark:bg-neutral-900 dark:border-neutral-800 dark:text-gray-100"
                    >
                      <p className="text-[13px] font-semibold text-blue-600">
                        {item.name}은 왜 필요할까요?
                      </p>
                      <p className="text-[13px] leading-5 text-gray-600">
                        {EXPLANATION_TEXT[item.id] ??
                          "이 항목에 대한 설명이 준비 중입니다."}
                      </p>
                    </HoverCardContent>
                  </HoverCard>
                </td>
                <td className="p-2">
                  <span className="break-words break-all">{item.score}</span>
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
                    onClick={() => onItemClick(item)}
                  >
                    {item.type}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 모바일 카드: md 미만에서 노출 */}
      <div className="space-y-3 md:hidden">
        {rows.map((item) => (
          <div
            key={item.id}
            className="p-3 bg-white border border-gray-200 shadow-sm rounded-xl dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs text-gray-500">#{item.id}</div>
                <div className="text-sm font-medium break-words break-all">
                  {item.name}
                </div>
              </div>
              <HoverCard openDelay={100} closeDelay={60}>
                <HoverCardTrigger asChild>
                  <Button
                    aria-label={`${item.name} 항목 설명`}
                    variant="ghost"
                    size="icon"
                    className="rounded-full shrink-0"
                  >
                    <Info className="w-4 h-4 text-blue-600" />
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent
                  align="end"
                  className="p-3 text-[13px] leading-5 w-72 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl"
                >
                  {EXPLANATION_TEXT[item.id] ??
                    "이 항목에 대한 설명이 준비 중입니다."}
                </HoverCardContent>
              </HoverCard>
            </div>

            <div className="flex items-center justify-between mt-2">
              <div className="text-xs text-gray-600 dark:text-gray-300">
                준수율: <span className="font-medium">{item.score}</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                className={`${
                  item.type === "진행중"
                    ? "bg-yellow-500 text-white"
                    : item.type === "대기"
                    ? "bg-gray-400 text-white"
                    : "bg-[#6C9AFF] text-white"
                }`}
                disabled={
                  !displayScan ||
                  (displayScan.status !== "completed" &&
                    item.type !== "진행중") ||
                  item.type === "대기"
                }
                onClick={() => onItemClick(item)}
              >
                {item.type}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
