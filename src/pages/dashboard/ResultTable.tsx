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
  1: "이미지에 간단한 설명을 넣으면,\n화면을 보지 못해도 내용을 이해할 수 있어요.",
  2: "영상에 자막을 넣으면 소리를\n듣기 어려운 사람도 내용을 이해할 수 있어요.",
  3: "표의 구조와 내용을 설명해주면,\n화면을 보지 않아도 표를 이해하기 쉬워요.",
  4: "영상이나 소리가 자동으로 나오지 않게 해야,\n화면 읽기 프로그램 사용자의 방해를 줄일 수 있어요.",
  5: "글자와 배경의 색을 충분히 구분하면,\n시력이 약한 사람도 내용을 잘 볼 수 있어요.",
  6: "마우스를 쓰기 어려운 사람도\n키보드만으로 모든 기능을 쓸 수 있어야 해요.",
  7: "입력창에 이름표를 붙이면\n어떤 내용을 써야 할지 쉽게 알 수 있어요.",
  8: "코드에 문법 오류가 없으면, 보조기기도\n웹 콘텐츠를 정확하게 전달할 수 있어요.",
  9: "페이지의 언어를 지정하면, 화면낭독프로그램이 정확한\n발음으로 읽어줄 수 있어요.",
  10: "페이지나 영역에 제목이 있으면,\n지금 보고 있는 곳이 어디인지 알기 쉬워요.",
  11: "시간 제한이 있는 경우, 천천히 사용해도 괜찮도록 시간\n을 조절할 수 있어야 해요.",
  12: "움직이는 배너나 콘텐츠는 멈출 수 있어야,\n누구나 편하게 정보를 볼 수 있어요.",
  13: "초당 3∼50회 주기로 깜빡이거나 번쩍이는 콘텐츠는 광\n과민성 발작을 일으킬 수 있어 유의해야 해요.",
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
    category: "video_caption",
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
    category: "video_autoplay",
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
        score: v.video_caption_completed
          ? v.video_caption_results
            ? `${
                v.video_caption_results.filter((r: any) => r.has_transcript)
                  .length
              } / ${v.video_caption_results.length}`
            : "검사 완료"
          : "검사중...",
        type: v.video_caption_completed ? "오류 확인" : "진행중",
        hasIssues: (v.video_caption_results || []).some(
          (r: any) => !r.has_transcript
        ),
        category: "video_caption",
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
        score: v.video_autoplay_completed
          ? v.video_autoplay_results
            ? `${
                v.video_autoplay_results.filter((r: any) => r.autoplay_disabled)
                  .length
              } / ${v.video_autoplay_results.length}`
            : "검사 완료"
          : "검사중...",
        type: v.video_autoplay_completed ? "오류 확인" : "진행중",
        hasIssues: (v.video_autoplay_results || []).some(
          (r: any) => !r.autoplay_disabled
        ),
        category: "video_autoplay",
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
    ...DEFAULT_ITEMS.map((base) => {
      const key = `${base.category}_results`;
      const res = v[key];
      let score = "검사 대기";
      let hasIssues = false;

      if (Array.isArray(res)) {
        let passCount = 0;

        switch (base.category) {
          case "alt_text":
            passCount = res.filter((r: any) => r.compliance === 0).length;
            hasIssues = res.some((r: any) => r.compliance !== 0);
            break;

          case "video_caption":
            passCount = res.filter((r: any) => r.has_transcript).length;
            hasIssues = res.some((r: any) => !r.has_transcript);
            break;

          case "video_autoplay":
            passCount = res.filter((r: any) => r.autoplay_disabled).length;
            hasIssues = res.some((r: any) => !r.autoplay_disabled);
            break;

          case "contrast":
            passCount = res.filter((r: any) => r.wcag_compliant).length;
            hasIssues = res.some((r: any) => !r.wcag_compliant);
            break;

          case "keyboard":
            passCount = res.filter((r: any) => r.accessible).length;
            hasIssues = res.some((r: any) => !r.accessible);
            break;

          case "label":
            passCount = res.filter((r: any) => r.label_present).length;
            hasIssues = res.some((r: any) => !r.label_present);
            break;

          default:
            // table / basic_language / markup_error / heading / response_time / pause_control / flashing
            passCount = res.filter((r: any) => r.compliant).length;
            hasIssues = res.some((r: any) => !r.compliant);
        }

        score = `${passCount} / ${res.length}`;
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
              <th className="p-2 text-left">순번</th>
              <th className="p-2 text-left">항목</th>
              <th className="p-2">항목 설명</th>
              <th className="p-2">준수율</th>
              <th className="p-2">오류 확인</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="p-2 text-left">{item.id}</td>
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
                      className="p-4 space-y-2 text-left text-gray-800 bg-white border border-gray-200 shadow-xl w-80 rounded-xl dark:bg-neutral-900 dark:border-neutral-800 dark:text-gray-100"
                    >
                      <p className="text-[13px] font-semibold text-blue-600">
                        {item.name}은 왜 필요할까요?
                      </p>
                      <p className="text-[13px] leading-5 text-gray-600 whitespace-pre-line text-left">
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
                  <p className="text-left whitespace-pre-line">
                    {EXPLANATION_TEXT[item.id] ??
                      "이 항목에 대한 설명이 준비 중입니다."}
                  </p>
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
