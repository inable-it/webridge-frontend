import { useEffect, useMemo, useRef } from "react";
import {
  useLocation,
  useNavigate,
  useSearchParams,
  type NavigateOptions,
} from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePdfGenerator } from "@/hooks/usePdfGenerator";
import {
  useCreateScanMutation,
  useGetScanListQuery,
} from "@/features/api/scanApi";
import SurveyModal from "@/components/common/SurveyModal";
import { toast } from "@/hooks/use-toast";

import { UrlScanForm } from "@/pages/dashboard/UrlScanForm";
import { ScanList } from "@/pages/dashboard/ScanList";
import { ResultTable } from "@/pages/dashboard/ResultTable";
import { useScanSelection } from "@/hooks/useScanSelection";
import { useScanPolling } from "@/hooks/useScanPolling";
import { useSurveyTrigger } from "@/hooks/useSurveyTrigger";

type DetailRow = Record<string, any>;

/* =========================================
 * 1) 항목 정의
 * ======================================= */
const CATS: {
  id: number;
  title: string;
  prop:
    | "alt_text_results"
    | "video_caption_results"
    | "video_autoplay_results"
    | "table_results"
    | "contrast_results"
    | "keyboard_results"
    | "label_results"
    | "markup_error_results"
    | "basic_language_results"
    | "heading_results"
    | "response_time_results"
    | "pause_control_results"
    | "flashing_results";
  isFail: (r: DetailRow) => boolean;
  isPass: (r: DetailRow) => boolean;
}[] = [
  {
    id: 1,
    title: "적절한 대체 텍스트 제공",
    prop: "alt_text_results",
    isFail: (r) => r.compliance !== 0,
    isPass: (r) => r.compliance === 0,
  },
  {
    id: 2,
    title: "자막 제공",
    prop: "video_caption_results",
    isFail: (r) => !r.has_transcript,
    isPass: (r) => !!r.has_transcript,
  },
  {
    id: 3,
    title: "표의 구성",
    prop: "table_results",
    isFail: (r) => !r.compliant,
    isPass: (r) => !!r.compliant,
  },
  {
    id: 4,
    title: "자동 재생 금지",
    prop: "video_autoplay_results",
    isFail: (r) => !r.autoplay_disabled,
    isPass: (r) => !!r.autoplay_disabled,
  },
  {
    id: 5,
    title: "텍스트 콘텐츠의 명도 대비",
    prop: "contrast_results",
    isFail: (r) => !r.wcag_compliant,
    isPass: (r) => !!r.wcag_compliant,
  },
  {
    id: 6,
    title: "키보드 사용 보장",
    prop: "keyboard_results",
    isFail: (r) => !r.accessible,
    isPass: (r) => !!r.accessible,
  },
  {
    id: 7,
    title: "레이블 제공",
    prop: "label_results",
    isFail: (r) => !r.label_present,
    isPass: (r) => !!r.label_present,
  },
  {
    id: 8,
    title: "마크업 오류 방지",
    prop: "markup_error_results",
    isFail: (r) => !r.compliant,
    isPass: (r) => !!r.compliant,
  },
  {
    id: 9,
    title: "기본 언어 표시",
    prop: "basic_language_results",
    isFail: (r) => !r.compliant,
    isPass: (r) => !!r.compliant,
  },
  {
    id: 10,
    title: "제목 제공",
    prop: "heading_results",
    isFail: (r) => !r.compliant,
    isPass: (r) => !!r.compliant,
  },
  {
    id: 11,
    title: "응답 시간 조절",
    prop: "response_time_results",
    isFail: (r) => !r.compliant,
    isPass: (r) => !!r.compliant,
  },
  {
    id: 12,
    title: "정지 기능 제공",
    prop: "pause_control_results",
    isFail: (r) => !r.compliant,
    isPass: (r) => !!r.compliant,
  },
  {
    id: 13,
    title: "깜빡임과 번쩍임 사용 제한",
    prop: "flashing_results",
    isFail: (r) => !r.compliant,
    isPass: (r) => !!r.compliant,
  },
];

// 결과 prop 유니온 타입
type Cat = (typeof CATS)[number]["prop"];

/* =========================================
 * 2) PDF 상세에 들어갈 "오류 스니펫" 추출 유틸
 *  - 오류 보기 화면과 같은 정보(코드/HTML/메시지 등)를
 *    최대한 뽑아오도록 키를 확장
 * ======================================= */
const S = (v: any) => {
  if (v == null) return "";
  if (typeof v === "string") return v.trim();
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  try {
    const flat: Record<string, any> = {};
    Object.entries(v).forEach(([k, val]) => {
      if (val == null) return;
      if (["string", "number", "boolean"].includes(typeof val)) flat[k] = val;
    });
    const s = JSON.stringify(flat);
    return s === "{}" ? "" : s;
  } catch {
    return "";
  }
};
const truncate = (s: string, max = 600) =>
  s.length > max ? s.slice(0, max) + "…" : s;

const pickMany = (obj: Record<string, any>, keys: string[]) => {
  for (const k of keys) {
    if (k in obj) {
      const sv = S(obj[k]);
      if (sv) return sv;
    }
  }
  return "";
};

const findDeepByKey = (obj: any, re: RegExp, maxDepth = 4): string => {
  const seen = new WeakSet();
  const walk = (o: any, d: number): string => {
    if (!o || typeof o !== "object" || seen.has(o) || d > maxDepth) return "";
    seen.add(o);
    for (const [k, v] of Object.entries(o)) {
      if (re.test(k)) {
        const sv = S(v);
        if (sv) return sv;
      }
      if (typeof v === "object") {
        const got = walk(v, d + 1);
        if (got) return got;
      }
    }
    return "";
  };
  return walk(obj, 0);
};

const styleSnippet = (style: any) => {
  if (!style) return "";
  if (typeof style === "string") return style;
  if (typeof style === "object") {
    const bg =
      style["background-image"] ||
      style["backgroundImage"] ||
      style["background"];
    if (bg) return `background-image: ${S(bg)}`;
    const color = style["color"] || style["fill"];
    const fs = style["font-size"] || style["fontSize"];
    const parts = [
      color ? `color:${S(color)}` : "",
      fs ? `font-size:${S(fs)}` : "",
    ].filter(Boolean);
    return parts.join("  ");
  }
  return "";
};

const CANDIDATE_KEYS_BY_CAT: Record<Cat, string[]> = {
  alt_text_results: [
    "outerHTML",
    "outer_html",
    "element_html",
    "node_html",
    "html",
    "selector",
    "xpath",
    "path",
    "cssPath",
    "src",
    "image_src",
    "data_src",
    "currentSrc",
    "message",
    "reason",
    "code",
    "snippet",
  ],
  video_caption_results: [
    "outerHTML",
    "outer_html",
    "element_html",
    "node_html",
    "html",
    "selector",
    "xpath",
    "src",
    "track_src",
    "video_src",
    "path",
    "message",
    "reason",
    "code",
    "snippet",
  ],
  video_autoplay_results: [
    "outerHTML",
    "outer_html",
    "element_html",
    "node_html",
    "html",
    "selector",
    "xpath",
    "src",
    "path",
    "message",
    "reason",
    "code",
    "snippet",
  ],
  table_results: [
    "outerHTML",
    "outer_html",
    "element_html",
    "node_html",
    "html",
    "selector",
    "xpath",
    "summary",
    "caption",
    "headers",
    "message",
    "reason",
    "code",
    "snippet",
  ],
  contrast_results: [
    "outerHTML",
    "outer_html",
    "element_html",
    "node_html",
    "html",
    "selector",
    "xpath",
    "text",
    "path",
    "message",
    "reason",
    "snippet",
  ],
  keyboard_results: [
    "outerHTML",
    "outer_html",
    "element_html",
    "node_html",
    "html",
    "selector",
    "xpath",
    "path",
    "role",
    "tabindex",
    "message",
    "reason",
    "code",
    "snippet",
  ],
  label_results: [
    "outerHTML",
    "outer_html",
    "element_html",
    "node_html",
    "html",
    "selector",
    "xpath",
    "for",
    "id",
    "name",
    "message",
    "reason",
    "code",
    "snippet",
  ],
  markup_error_results: [
    "outerHTML",
    "outer_html",
    "element_html",
    "node_html",
    "html",
    "selector",
    "xpath",
    "path",
    "tag",
    "message",
    "error",
    "code",
    "snippet",
  ],
  basic_language_results: [
    "outerHTML",
    "outer_html",
    "element_html",
    "node_html",
    "html",
    "selector",
    "xpath",
    "lang",
    "message",
    "reason",
    "snippet",
  ],
  heading_results: [
    "outerHTML",
    "outer_html",
    "element_html",
    "node_html",
    "html",
    "selector",
    "xpath",
    "text",
    "level",
    "message",
    "reason",
    "snippet",
  ],
  response_time_results: [
    "outerHTML",
    "outer_html",
    "element_html",
    "node_html",
    "html",
    "selector",
    "xpath",
    "message",
    "reason",
    "snippet",
  ],
  pause_control_results: [
    "outerHTML",
    "outer_html",
    "element_html",
    "node_html",
    "html",
    "selector",
    "xpath",
    "message",
    "reason",
    "snippet",
  ],
  flashing_results: [
    "outerHTML",
    "outer_html",
    "element_html",
    "node_html",
    "html",
    "selector",
    "xpath",
    "frequency",
    "message",
    "reason",
    "snippet",
  ],
};

function extractIssueTextForPdf(prop: Cat, r: Record<string, any>) {
  // 1) 항목 우선 키
  const primary = pickMany(r, CANDIDATE_KEYS_BY_CAT[prop]);

  // 2) 깊이 탐색으로 html/snippet 류 보강
  const deepHtml =
    primary ||
    findDeepByKey(
      r,
      /(outer|inner)?HTML|element_html|node_html|snippet|code/i,
      4
    );

  // 3) 항목별 메타
  const extras: string[] = [];
  switch (prop) {
    case "alt_text_results": {
      const alt =
        r.alt !== undefined
          ? `alt:${S(r.alt)}`
          : r.alt_text !== undefined
          ? `alt:${S(r.alt_text)}`
          : "";
      if (alt) extras.push(alt);
      const bg = findDeepByKey(r, /background-?image/i, 2);
      if (bg) extras.push(`bg:${bg}`);
      break;
    }
    case "video_caption_results":
      if (r.has_transcript === false) extras.push("no transcript");
      break;
    case "video_autoplay_results":
      if (r.autoplay_detected || r.autoplay) extras.push("autoplay:true");
      break;
    case "label_results":
      if (r.for) extras.push(`for:${S(r.for)}`);
      if (r.label_text) extras.push(`<label>${S(r.label_text)}</label>`);
      break;
    case "keyboard_results":
      if (r.role) extras.push(`role:${S(r.role)}`);
      if (r.tabindex != null) extras.push(`tabindex:${S(r.tabindex)}`);
      break;
    case "markup_error_results":
      if (r.tag) extras.push(`<${S(r.tag)}>`);
      if (r.message) extras.push(`msg:${S(r.message)}`);
      break;
    case "basic_language_results":
      if (r.lang) extras.push(`lang:${S(r.lang)}`);
      break;
    case "heading_results":
      if (r.level) extras.push(`h${S(r.level)}`);
      break;
  }

  // 4) 최종 조립
  const base =
    deepHtml ||
    pickMany(r, [
      "selector",
      "xpath",
      "cssPath",
      "path",
      "src",
      "image_src",
      "data_src",
      "href",
      "text",
      "textContent",
      "name",
      "id",
      "tagName",
      "title",
      "message",
      "reason",
    ]) ||
    styleSnippet(r.style);

  const joined = [base, ...extras].filter(Boolean).join("  •  ");
  return truncate(joined || "-");
}

/* =========================================
 * 3) 가이드 텍스트
 * ======================================= */
const GUIDE_TEXT: Record<
  number,
  { judge: string[]; how: string[]; consider: string[] }
> = {
  1: {
    judge: [
      "이미지에 alt가 입력되지 않은 경우",
      '의미 있는 이미지에 빈 alt(alt="")가 설정된 경우',
    ],
    how: [
      "의미 있는 배경이미지라면 실제 <img>로 교체하고 alt를 제공합니다.",
      '장식용 이미지(의미 없음)는 alt=""로 비워 보조기기에 노출하지 않습니다.',
      "텍스트 이미지 대신 실 텍스트 사용을 우선 고려합니다.",
    ],
    consider: [
      "이미지를 설명해주는 인접 텍스트가 충분하면 별도 대체텍스트를 생략할 수도 있습니다.",
      "대체텍스트는 해당 이미지를 이해할 수 있도록 간결·정확해야 합니다.",
    ],
  },
};

const DEFAULT_GUIDE = {
  judge: ["해당 항목의 검사 기준을 만족하지 않는 패턴이 탐지되었습니다."],
  how: [
    "관련 KWCAG/WCAG 기준에 따라 마크업과 상호작용을 보완합니다.",
    "역할과 상태를 스크린리더가 인식할 수 있도록 적절한 속성/구조를 제공합니다.",
  ],
  consider: [
    "색 대비, 키보드 접근성, 포커스 이동, 라이브영역 등 연관 준수 항목도 함께 점검하세요.",
  ],
};

/* =========================================
 * 4) 공통 포맷터
 * ======================================= */
function formatCompliance(pass: number, total: number) {
  if (!total) return "-";
  const pct = Math.round((pass / total) * 100);
  return `${pct}%(${pass}/${total})`;
}

/* =========================================
 * 5) PDF 요약 테이블
 *   - 명도 대비 항목만 준수율 하이픈 처리
 * ======================================= */
const PdfSummaryTable = ({
  selectedScanDetail,
}: {
  selectedScanDetail: any | null;
}) => {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b">
          <th className="w-20 p-3 text-left">순번</th>
          <th className="p-3 text-left">검사 항목</th>
          <th className="p-3 text-right w-36">준수율</th>
        </tr>
      </thead>
      <tbody>
        {CATS.map((cat) => {
          const all: DetailRow[] =
            (selectedScanDetail && selectedScanDetail[cat.prop]) || [];
          const pass = all.filter(cat.isPass).length;
          const total = all.length || 0;

          const isContrast = cat.prop === "contrast_results";
          const display = isContrast ? "-" : formatCompliance(pass, total);

          return (
            <tr key={cat.id} className="border-b last:border-b-0">
              <td className="p-3">{cat.id}</td>
              <td className="p-3">{cat.title}</td>
              <td className="p-3 text-right">{display}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

/* =========================================
 * 6) 페이지 본문
 * ======================================= */
const DashboardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const resultPanelRef = useRef<HTMLDivElement | null>(null);
  const { generatePdf } = usePdfGenerator();

  const {
    data: scanListData,
    isLoading: isLoadingList,
    refetch: refetchScanList,
  } = useGetScanListQuery({ page: 1, page_size: 50, ordering: "-created_at" });

  const {
    selectedScanId,
    setSelectedScanId,
    displayScan,
    isDisplayingScanDetail,
    selectedScanDetail,
    selectedStatus,
    progressingScanIds,
    refetchDetail,
  } = useScanSelection(scanListData);

  useScanPolling({
    progressingScanIds,
    selectedScanId,
    selectedStatus,
    refetchList: refetchScanList,
    refetchDetail,
  });

  const { openSurvey, closeSurvey } = useSurveyTrigger({
    scanListData,
    selectedScanDetail,
  });

  // 히스토리/딥링크에서 넘어온 scanId 추출
  const incomingScanId = useMemo(() => {
    const fromState = location.state?.scanId as string | undefined;
    const fromQuery = searchParams.get("scanId") || undefined;
    return fromState ?? fromQuery;
  }, [location.state, searchParams]);

  // 목록이 로드되면 incomingScanId 자동 선택 + 포커스 + state/쿼리 정리
  useEffect(() => {
    if (!scanListData?.results || !incomingScanId) return;

    const exists = scanListData.results.some((s) => s.id === incomingScanId);
    if (!exists) return;

    setSelectedScanId(incomingScanId);

    requestAnimationFrame(() => {
      resultPanelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });

    const opts: NavigateOptions = { replace: true, state: {} };
    if (searchParams.has("scanId")) {
      const sp = new URLSearchParams(searchParams);
      sp.delete("scanId");
      navigate(
        { pathname: location.pathname, search: sp.toString() ? `?${sp}` : "" },
        opts
      );
    } else if (location.state?.scanId) {
      navigate(location.pathname, opts);
    }
  }, [
    scanListData?.results,
    incomingScanId,
    setSelectedScanId,
    navigate,
    location.pathname,
    location.state,
    searchParams,
  ]);

  const [createScan, { isLoading: isCreating }] = useCreateScanMutation();
  const onStartScan = async (url: string) => {
    try {
      const result = await createScan({ url }).unwrap();
      toast({
        title: "검사 시작",
        description: "웹 접근성 검사가 시작되었습니다!",
      });
      setSelectedScanId(result.scan.id);
      refetchScanList();
    } catch (error: any) {
      console.error("스캔 생성 실패:", error);
      toast({
        title: "오류",
        description: error?.data?.message || "검사 시작에 실패했습니다.",
      });
    }
  };

  return (
    <>
      <div className="flex min-h-screen bg-[#ecf3ff] p-8 gap-5">
        {/* 왼쪽: 입력 + 최근 검사 */}
        <div className="flex w-[320px] space-y-6 rounded-lg flex-col">
          <div className="w-[320px] bg-[#f4f8ff] border-2 p-6 space-y-6 rounded-lg">
            <UrlScanForm isCreating={isCreating} onStartScan={onStartScan} />
          </div>

          <div className="w-[320px] bg-[#f4f8ff] border-2 p-6 space-y-6 rounded-lg">
            <ScanList
              isLoading={isLoadingList}
              scanList={scanListData?.results || []}
              selectedScanId={selectedScanId}
              onSelect={setSelectedScanId}
            />
          </div>
        </div>

        {/* 오른쪽: 검사 결과(대시보드용). PDF 레이아웃은 오프스크린 처리 */}
        <div
          ref={resultPanelRef}
          className="flex-1 min-w-0 p-8 bg-white border-2 rounded-lg shadow-md"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1 min-w-0 mr-4">
              <h1 className="text-xl font-semibold">
                WEBridge 웹 접근성 검사 요약 보고서
              </h1>
              <p className="mt-1 text-sm text-gray-500 break-words">
                {displayScan ? (
                  <>
                    홈페이지명 : {displayScan.title || "(제목 없음)"} <br />
                    <span className="break-all">{displayScan.url}</span>
                  </>
                ) : (
                  <>
                    홈페이지명 : 검사를 시작해주세요 <br /> URL을 입력하고
                    검사를 시작하면 결과가 표시됩니다
                  </>
                )}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                {new Date().toLocaleDateString("ko-KR")} / 한국형 웹 콘텐츠
                접근성 지침 2.2 기준
              </p>
            </div>

            <Button
              onClick={() =>
                generatePdf(
                  ["summaryReport", "detailReport"], // 요약 → 상세 (둘 다 오프스크린)
                  `webridge-report-${displayScan?.title || "report"}.pdf`,
                  {
                    targetDpi: 144,
                    baseScale: 2,
                    marginMm: 10,
                    backgroundColor: "#ffffff",
                  }
                )
              }
              disabled={!displayScan || displayScan.status !== "completed"}
            >
              PDF로 저장하기
            </Button>
          </div>

          {/* 대시보드 화면에서만 보이는 기본 테이블 */}
          <div className="p-6 bg-white border rounded-lg">
            <ResultTable
              displayScan={displayScan}
              isDisplayingScanDetail={isDisplayingScanDetail}
              selectedScanDetail={selectedScanDetail}
              onNavigate={(path) => navigate(path)}
            />
          </div>
        </div>
      </div>

      {/* === PDF 전용 섹션: 화면에 보이지 않도록 오프스크린 렌더링 === */}
      {/* 1) 요약 보고서 (PDF 첫 페이지) */}
      <div
        id="summaryReport"
        aria-hidden
        className="fixed -left-[200vw] top-0 w-[900px] p-10 bg-white"
        style={{ zIndex: -1 }}
      >
        <h1 className="mb-6 text-3xl font-bold text-center">
          WEBridge 웹 접근성 검사 보고서
        </h1>
        <div className="h-px mb-6 bg-gray-200" />
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm text-gray-600">
          <div className="space-y-1">
            <p>
              <span className="font-semibold">홈페이지명 :</span>{" "}
              {displayScan?.title || "-"}
            </p>
            <p className="break-all">
              <span className="font-semibold">URL :</span>{" "}
              {displayScan?.url || "-"}
            </p>
            <p>
              <span className="font-semibold">검사 일시 :</span>{" "}
              {new Date().toLocaleDateString("ko-KR")} 00:00
            </p>
          </div>
          <div className="space-y-1 text-right">
            <p>
              <span className="font-semibold">사용 검진 도구 :</span> WEBridge
              1.0
            </p>
            <p>
              <span className="font-semibold">검사 기준 :</span> 한국형 웹
              콘텐츠 접근성 지침 2.2
            </p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl">
          <div className="px-4 py-3 border-b">
            <p className="text-sm font-medium text-gray-700">
              웹 접근성 검사 요약 보고서
            </p>
          </div>
          <div className="p-4">
            <PdfSummaryTable selectedScanDetail={selectedScanDetail} />
          </div>
        </div>
      </div>

      {/* 2) 상세 보고서 (PDF 두 번째 페이지부터) */}
      <div
        id="detailReport"
        aria-hidden
        className="fixed -left-[200vw] top-0 w-[900px] p-10 bg-white"
        style={{ zIndex: -1 }}
      >
        <header className="mb-8">
          <h1 className="mb-6 text-2xl font-bold text-center">
            WEBridge 웹 접근성 검사 보고서
          </h1>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="space-y-1">
              <p>
                <span className="font-semibold">홈페이지명 :</span>{" "}
                {displayScan?.title || "-"}
              </p>
              <p className="break-all">
                <span className="font-semibold">URL :</span>{" "}
                {displayScan?.url || "-"}
              </p>
            </div>
            <div className="space-y-1 text-right">
              <p>
                <span className="font-semibold">사용 검진 도구 :</span> WEBridge
                1.0
              </p>
              <p>
                <span className="font-semibold">검사 일시 :</span>{" "}
                {new Date().toLocaleDateString("ko-KR")} 00:00
              </p>
              <p>
                <span className="font-semibold">검사 기준 :</span> 한국형 웹
                콘텐츠 접근성 지침 2.2
              </p>
            </div>
          </div>
        </header>

        <div className="space-y-8">
          {CATS.map((cat) => {
            const all: DetailRow[] =
              (selectedScanDetail && selectedScanDetail[cat.prop]) || [];
            const pass = all.filter(cat.isPass).length;
            const total = all.length || 0;
            const isContrast = cat.prop === "contrast_results";
            const issues = isContrast ? [] : all.filter(cat.isFail);
            const guide = GUIDE_TEXT[cat.id] || DEFAULT_GUIDE;

            return (
              <section key={cat.id} className="space-y-4">
                <div className="flex items-baseline justify-between">
                  <h2 className="text-base font-semibold">
                    [상세 보고서] {cat.id}. {cat.title}
                  </h2>
                  <div className="text-sm text-gray-600">
                    준수율 : {isContrast ? "-" : formatCompliance(pass, total)}
                  </div>
                </div>

                {/* 명도 대비는 지원 제외 안내 */}
                {isContrast ? (
                  <div className="p-6 text-center border border-gray-200 rounded-2xl">
                    <p className="font-medium text-red-600">
                      현재 지원하지 않는 검사 항목입니다.
                    </p>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-2xl">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="w-20 p-3 text-left">순번</th>
                          <th className="p-3 text-left">미준수 항목</th>
                        </tr>
                      </thead>
                      <tbody>
                        {issues.length ? (
                          issues.map((r, idx) => (
                            <tr key={idx} className="border-b last:border-b-0">
                              <td className="p-3">{idx + 1}</td>
                              <td className="p-3 break-all">
                                {extractIssueTextForPdf(cat.prop, r)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className="p-4 text-gray-500" colSpan={2}>
                              표기할 이슈가 없습니다.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 가이드 */}
                <div className="rounded-2xl bg-[#eaf2ff] p-5 space-y-3">
                  <p className="font-semibold">
                    [수정 참고 가이드] {cat.id}. {cat.title}
                  </p>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">
                      현재 “{cat.title}” 항목의 오류 대상은 다음과 같은 기준으로
                      판단하고 있어요.
                    </p>
                    <ul className="pl-5 text-sm text-gray-700 list-disc">
                      {guide.judge.map((t, i) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">
                      이를 수정하기 위해서는 아래 내용을 준수하세요.
                    </p>
                    <ul className="pl-5 text-sm text-gray-700 list-disc">
                      {guide.how.map((t, i) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">
                      WEBridge 검사 이외에 이런 점도 고려해야 해요.
                    </p>
                    <ul className="pl-5 text-sm text-gray-700 list-disc">
                      {guide.consider.map((t, i) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </div>

      <SurveyModal open={openSurvey} onClose={closeSurvey} />
    </>
  );
};

export default DashboardPage;
