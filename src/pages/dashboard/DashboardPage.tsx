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
import { SummaryReport, DetailReport } from "@/components/report/PdfSections";

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

  const incomingScanId = useMemo(() => {
    const fromState = location.state?.scanId as string | undefined;
    const fromQuery = searchParams.get("scanId") || undefined;
    return fromState ?? fromQuery;
  }, [location.state, searchParams]);

  useEffect(() => {
    if (!scanListData?.results || !incomingScanId) return;
    const exists = scanListData.results.some(
      (s: any) => s.id === incomingScanId
    );
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

        {/* 오른쪽: 검사 결과(대시보드) */}
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
                  ["summaryReport", "detailReport"],
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

      {/* 오프스크린 PDF 섹션 */}
      <SummaryReport
        displayScan={displayScan}
        selectedScanDetail={selectedScanDetail}
      />
      <DetailReport
        displayScan={displayScan}
        selectedScanDetail={selectedScanDetail}
      />

      <SurveyModal open={openSurvey} onClose={closeSurvey} />
    </>
  );
};

export default DashboardPage;
