import { CATS } from "@/constants/accessibilityCats";
import { GUIDE_TEXT, DEFAULT_GUIDE } from "@/constants/guideText";
import { formatCompliance } from "@/utils/format";
import { extractIssueTextForPdf } from "@/utils/pdfIssueExtract";
import type { DetailRow } from "@/types/report";
import { PdfSummaryTable } from "./PdfSummaryTable";

/** PDF: 요약 섹션 (오프스크린) */
export const SummaryReport = ({
  displayScan,
  selectedScanDetail,
}: {
  displayScan: any | null;
  selectedScanDetail: any | null;
}) => {
  return (
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
      <div className="grid grid-cols-2 gap-4 mb-6 text-sm text-gray-700">
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
            <span className="font-semibold">사용 검진 도구 :</span> WEBridge 1.0
          </p>
          <p>
            <span className="font-semibold">검사 기준 :</span> 한국형 웹 콘텐츠
            접근성 지침 2.2
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
  );
};

/** PDF: 상세 섹션 (오프스크린) */
export const DetailReport = ({
  displayScan,
  selectedScanDetail,
}: {
  displayScan: any | null;
  selectedScanDetail: any | null;
}) => {
  return (
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
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
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
          const guide = (GUIDE_TEXT as any)[cat.id] || DEFAULT_GUIDE;

          return (
            <section key={cat.id} className="space-y-4">
              <div className="flex items-baseline justify-between">
                <h2 className="text-base font-semibold">
                  [상세 보고서] {cat.id}. {cat.title}
                </h2>
                <div className="text-sm text-gray-700">
                  준수율 : {isContrast ? "-" : formatCompliance(pass, total)}
                </div>
              </div>

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
                        issues.map((r, idx) => {
                          const content =
                            // 1) 요소 HTML이 있으면 그걸 우선 표시
                            (r as any)?.element_html &&
                            String((r as any).element_html).trim()
                              ? (r as any).element_html
                              : // 2) 없으면 기존 스니펫 추출 로직 사용
                                extractIssueTextForPdf(cat.prop, r);

                          return (
                            <tr key={idx} className="border-b last:border-b-0">
                              <td className="p-3">{idx + 1}</td>
                              <td className="p-3">
                                <div className="break-all whitespace-pre-wrap font-mono text-[12px] leading-5">
                                  {content}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td className="p-4 text-gray-700" colSpan={2}>
                            표기할 이슈가 없습니다.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 가이드 */}
              <div className="rounded-2xl bg-blue-50 p-5 space-y-3">
                <p className="font-semibold"> [{cat.title}] 수정 가이드</p>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">
                    ℹ️ WEBridge는 [{cat.title}] 미준수 여부를 다음 기준으로
                    확인해요.
                  </p>
                  {guide.judge.map((t: string, i: number) => (
                    <div
                      key={i}
                      className="flex items-center text-sm text-gray-700"
                    >
                      <span className="mr-2">•</span>
                      <span className="flex-1">{t}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">
                    ℹ️ 오류 항목을 수정하기 위해 아래 내용을 준수해야 해요.
                  </p>
                  {guide.how.map((t: string, i: number) => (
                    <div
                      key={i}
                      className="flex items-center text-sm text-gray-700"
                    >
                      <span className="mr-2">•</span>
                      <span className="flex-1">{t}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">
                    💡 WEBridge 검사 이외에 이런 점도 고려해야 해요.
                  </p>
                  {guide.consider.map((t: string, i: number) => (
                    <div
                      key={i}
                      className="flex items-center text-sm text-gray-700"
                    >
                      <span className="mr-2">•</span>
                      <span className="flex-1">{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};
