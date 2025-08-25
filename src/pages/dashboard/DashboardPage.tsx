import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
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

const CATS: {
  id: number;
  title: string;
  // selectedScanDetail의 프로퍼티 키
  prop:
    | "alt_text_results"
    | "video_results"
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
  // 실패(이슈) 판별 함수
  isFail: (r: DetailRow) => boolean;
  // 점수 계산용 “성공” 판별 함수
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
    prop: "video_results",
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
    prop: "video_results",
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

// ---- [상세 보고서 가이드 텍스트] ----
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
  // 필요하면 항목별 맞춤 문구를 아래에 추가
};

// 기본 가이드(해당 id가 없을 때 사용)
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

// 점수 표시 형태: 예) 10%(1/10)
function formatCompliance(pass: number, total: number) {
  if (!total) return "-";
  const pct = Math.round((pass / total) * 100);
  return `${pct}%(${pass}/${total})`;
}

// 각 이슈 행에서 텍스트 추출(없으면 JSON)
function extractIssueText(r: Record<string, any>) {
  return (
    r.selector ||
    r.src ||
    r.text ||
    r.path ||
    r.id ||
    r.name ||
    r.tagName ||
    JSON.stringify(r)
  );
}

const DashboardPage = () => {
  const navigate = useNavigate();
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

        {/* 오른쪽: 검사 결과 */}
        <div className="flex-1 min-w-0 p-8 bg-white border-2 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1 min-w-0 mr-4">
              <h1 className="text-xl font-semibold">
                WEBridge 웹 접근성 검사 요약 보고서
              </h1>
              <p className="mt-1 text-sm text-gray-500 break-words">
                {displayScan ? (
                  <>
                    홈페이지명 : {displayScan.title} <br />
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
              {displayScan?.status === "completed" &&
                isDisplayingScanDetail && (
                  <div className="flex flex-wrap items-center gap-4 mt-2">
                    <div className="text-sm">
                      <span className="font-semibold text-green-600">
                        준수율: {displayScan.compliance_score?.toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="font-semibold text-red-600">
                        총 이슈: {displayScan.total_issues}개
                      </span>
                    </div>
                  </div>
                )}
            </div>

            <Button
              onClick={() =>
                generatePdf(
                  ["summaryReport", "detailReport"], // 요약 + (오프스크린) 상세
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

          {/* 1) 화면에 보이는 요약 섹션 */}
          <div id="summaryReport" className="p-6 bg-white border rounded-lg">
            <ResultTable
              displayScan={displayScan}
              isDisplayingScanDetail={isDisplayingScanDetail}
              selectedScanDetail={selectedScanDetail}
              onNavigate={(path) => navigate(path)}
            />
          </div>

          {/* 2) 화면에는 보이지 않지만 DOM에만 존재하는 상세 섹션 (오프스크린) */}
          {/*  - display:none, hidden, opacity:0 는 html2canvas가 캡쳐 못 하니 사용 금지
              - 화면 밖으로 크게 이동: fixed + -left 로 사용자에게 보이지 않게 */}
          {/* PDF 전용: 화면엔 보이지 않게 오프스크린 렌더링 */}
          <div
            id="detailReport"
            aria-hidden
            className="fixed -left-[200vw] top-0 w-[900px] p-10 bg-white"
            style={{
              zIndex: -1,
            }}
          >
            {/* 상단 제목/메타(이미지처럼) */}
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
                    <span className="font-semibold">사용 검진 도구 :</span>{" "}
                    WEBridge 1.0
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

            {/* ---- 각 항목 상세 블록 ---- */}
            <div className="space-y-8">
              {CATS.map((cat) => {
                const all: Record<string, any>[] =
                  (selectedScanDetail && selectedScanDetail[cat.prop]) || [];
                const pass = all.filter(cat.isPass).length;
                const total = all.length || 0;
                const issues = all.filter(cat.isFail);

                const guide = GUIDE_TEXT[cat.id] || DEFAULT_GUIDE;

                return (
                  <section key={cat.id} className="space-y-4">
                    {/* 섹션 상단 타이틀 + 점수 */}
                    <div className="flex items-baseline justify-between">
                      <h2 className="text-base font-semibold">
                        [상세 보고서] {cat.id}. {cat.title}
                      </h2>
                      <div className="text-sm text-gray-600">
                        준수율 : {formatCompliance(pass, total)}
                      </div>
                    </div>

                    {/* 표 카드 */}
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
                              <tr
                                key={idx}
                                className="border-b last:border-b-0"
                              >
                                <td className="p-3">{idx + 1}</td>
                                <td className="p-3 break-all">
                                  {extractIssueText(r)}
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

                    {/* 가이드 박스(블루 톤) */}
                    <div className="rounded-2xl bg-[#eaf2ff] p-5 space-y-3">
                      <p className="font-semibold">
                        [수정 참고 가이드] {cat.id}. {cat.title}
                      </p>

                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">
                          현재 “{cat.title}” 항목의 오류 대상은 다음과 같은
                          기준으로 판단하고 있어요.
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
        </div>
      </div>

      <SurveyModal open={openSurvey} onClose={closeSurvey} />
    </>
  );
};

export default DashboardPage;
