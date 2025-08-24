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

const DashboardPage = () => {
  const navigate = useNavigate();
  const { generatePdf } = usePdfGenerator();

  const {
    data: scanListData,
    isLoading: isLoadingList,
    refetch: refetchScanList,
  } = useGetScanListQuery({ page: 1, page_size: 5, ordering: "-created_at" });

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
      <div className="flex h-screen bg-[#ecf3ff] p-8 gap-5">
        {/* 왼쪽: 입력 + 최근 검사 */}
        <div className="flex w-[320px] space-y-6 rounded-lg flex-col">
          <div className="w-[320px] bg-[#f4f8ff] border-2 p-6 space-y-6 rounded-lg">
            <UrlScanForm isCreating={isCreating} onStartScan={onStartScan} />
          </div>

          <div className="w-[320px] bg-[#f4f8ff] border-2 p-6 space-y-6 rounded-lg h-full">
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
                generatePdf("reportContent", "accessibility-report.pdf")
              }
              disabled={!displayScan || displayScan.status !== "completed"}
              className="flex-shrink-0"
            >
              PDF로 저장하기
            </Button>
          </div>

          <div
            className="p-6 overflow-hidden bg-white border rounded-lg"
            id="reportContent"
          >
            <ResultTable
              displayScan={displayScan}
              isDisplayingScanDetail={isDisplayingScanDetail}
              selectedScanDetail={selectedScanDetail}
              onNavigate={(path) => navigate(path)}
            />
          </div>
        </div>
      </div>

      <SurveyModal open={openSurvey} onClose={closeSurvey} />
    </>
  );
};

export default DashboardPage;
