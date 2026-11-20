import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useGetScanDetailQuery } from "@/features/api/scanApi";
import type { AccessibilityScanDetail } from "@/features/api/scanApi";
import { getCategoryInfo } from "@/utils/categoryMap";
import { isAltTextCompliant } from "@/utils/altText";
import { isVideoCaptionCompliant } from "@/pages/scan-detail/components/VideoDetail";
import { isAutoPlayCompliant } from "@/pages/scan-detail/components/AutoPlayDetail";
import { isContrastCompliant } from "@/pages/scan-detail/components/ContrastDetail";
import { isKeyboardCompliant } from "@/pages/scan-detail/components/KeyboardDetail";
import { isLabelCompliant } from "@/pages/scan-detail/components/LabelDetail";
import { isMarkupErrorCompliant } from "@/pages/scan-detail/components/MarkupErrorDetail";
import { isBasicLanguageCompliant } from "@/pages/scan-detail/components/BasicLanguageDetail";
import { isHeadingCompliant } from "@/pages/scan-detail/components/HeadingDetail";
import { isResponseTimeCompliant } from "@/pages/scan-detail/components/ResponseTimeDetail";
import { isPauseControlCompliant } from "@/pages/scan-detail/components/PauseControlDetail";
import { isTableCompliant } from "@/pages/scan-detail/components/TableDetail";
import { isFlashingCompliant } from "@/pages/scan-detail/components/FlashingDetail";

const AccessibilityScanDetailPage = () => {
  const { scanId, category } = useParams<{
    scanId: string;
    category: string;
  }>();
  const navigate = useNavigate();

  const {
    data: scanDetail,
    isLoading,
    error,
  } = useGetScanDetailQuery(scanId!, {
    skip: !scanId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">검사 결과를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !scanDetail) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-600" />
          <p className="text-gray-600">검사 결과를 불러올 수 없습니다.</p>
          <Button onClick={() => navigate("/dashboard")} className="mt-4">
            대시보드로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  const categoryInfo = getCategoryInfo(category || "");
  const resolvedCategoryKey =
    category === "video"
      ? "video_caption"
      : category === "auto_play"
      ? "video_autoplay"
      : category;
  const resultsKey = `${resolvedCategoryKey}_results` as keyof AccessibilityScanDetail;
  const fallbackResultsKey = `${category}_results` as keyof AccessibilityScanDetail;
  const hasResultsKey =
    !!category && (resultsKey in scanDetail || fallbackResultsKey in scanDetail);

  if (!categoryInfo || !category || !hasResultsKey) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-yellow-600" />
          <p className="text-gray-600">해당 검사 항목을 찾을 수 없습니다.</p>
          <Button onClick={() => navigate("/dashboard")} className="mt-4">
            대시보드로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  const results =
    ((scanDetail[resultsKey] ?? scanDetail[fallbackResultsKey]) as any[]) || [];
  const DetailComponent = categoryInfo.component;

  // 이슈가 있는 결과만 필터링
  const issueResults = results.filter((result: any) => {
    switch (category) {
      case "alt_text":
        // 상세 화면의 준수/미준수 탭과 같은 기준 사용
        return !isAltTextCompliant(result.compliance);
      case "contrast":
        return !isContrastCompliant(result);
      case "keyboard":
        return !isKeyboardCompliant(result);
      case "label":
        return !isLabelCompliant(result);
      case "markup_error":
        return !isMarkupErrorCompliant(result);
      case "basic_language":
        return !isBasicLanguageCompliant(result);
      case "heading":
        return !isHeadingCompliant(result);
      case "response_time":
        return !isResponseTimeCompliant(result);
      case "pause_control":
        return !isPauseControlCompliant(result);
      case "table":
        return !isTableCompliant(result);
      case "flashing":
        return !isFlashingCompliant(result);
      case "video":
      case "video_caption":
        return !isVideoCaptionCompliant(result);
      case "auto_play":
      case "video_autoplay":
        return !isAutoPlayCompliant(result);
      default:
        return !result.compliant;
    }
  });

  return (
    <div className="min-h-screen bg-[#EEF3FB] p-6 sm:p-8">
      <div className="max-w-5xl p-6 mx-auto bg-white shadow-sm sm:p-8 rounded-xl">
        {/* 1 & 2: 상단 버튼 영역 (요약보고서로 돌아가기 / 사이트 보기) */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-gray-200">
          <Button
            size="sm"
            onClick={() => navigate("/dashboard", { state: { scanId } })}
            className="px-4 py-2 text-xs font-medium text-white bg-[#2563EB] hover:bg-blue-700 rounded-md"
          >
            요약보고서로 돌아가기
          </Button>

          <Button
            onClick={() => window.open(scanDetail.url, "_blank")}
            variant="outline"
            size="sm"
            className="px-4 py-2 text-xs font-medium text-[#2563EB] bg-white border border-[#2563EB] hover:bg-blue-50 rounded-md"
          >
            사이트 보기
          </Button>
        </div>

        {/* 3: 검사 수 정보 (총 검사 대상 / 준수 개수 / 미준수 개수) */}
        <div className="mb-8">
          <h2 className="mb-3 text-xl font-bold text-gray-900">
            {categoryInfo.title}
          </h2>
          <div className="flex flex-wrap items-center gap-6 px-5 py-3.5 text-sm font-medium text-gray-900 bg-white border border-gray-400 rounded-lg">
            <span>총 검사 대상 : {results.length}개</span>
            <span>준수 개수 : {results.length - issueResults.length}개</span>
            <span>미준수 개수 : {issueResults.length}개</span>
          </div>
        </div>

        {/* 수정 가이드 및 검사 결과 상세 (4. 준수/미준수 탭, 5. 대상 순번, 6. html 더보기) */}
        <DetailComponent
          results={results}
          scanUrl={scanDetail.url}
        />
      </div>
    </div>
  );
};

export default AccessibilityScanDetailPage;
