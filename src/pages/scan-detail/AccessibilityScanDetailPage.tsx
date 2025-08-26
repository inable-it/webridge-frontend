import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { useGetScanDetailQuery } from "@/features/api/scanApi";
import type { AccessibilityScanDetail } from "@/features/api/scanApi";
import { getCategoryInfo } from "@/pages/scan-detail/categoryMap";

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
  const resultsKey = `${category}_results` as keyof AccessibilityScanDetail;

  if (!categoryInfo || !category || !(resultsKey in scanDetail)) {
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

  const results = (scanDetail[resultsKey] as any[]) || [];
  const DetailComponent = categoryInfo.component;

  // 이슈가 있는 결과만 필터링
  const issueResults = results.filter((result: any) => {
    switch (category) {
      case "alt_text":
        return result.compliance !== 0;
      case "contrast":
        return !result.wcag_compliant;
      case "keyboard":
        return !result.accessible;
      case "label":
        return !result.label_present;
      case "table":
        return !result.compliant;
      case "video":
        return (
          !result.has_transcript ||
          !result.autoplay_disabled ||
          !result.has_aria_label
        );
      default:
        return !result.compliant;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-4xl px-4 mx-auto sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard")}
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                요약 보고서로 돌아가기
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <Button
                onClick={() => window.open(scanDetail.url, "_blank")}
                variant="outline"
                size="sm"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                사이트 보기
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl px-4 py-8 mx-auto sm:px-6 lg:px-8">
        {/* 검사 항목 설명 */}
        <div className="p-6 mb-8 bg-white border rounded-lg shadow-sm">
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            {categoryInfo.title}
          </h2>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>문제 발견: {issueResults.length}개</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>정상: {results.length - issueResults.length}개</span>
            </div>
            <div className="text-gray-500">
              총 검사 대상: {results.length}개
            </div>
          </div>
        </div>

        {/* 검사 결과 상세 */}
        <div className="bg-white border rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              문제가 발견된 항목들
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              아래 항목들을 수정하여 웹 접근성을 개선하세요.
            </p>
          </div>
          <div className="p-6">
            {issueResults.length > 0 ? (
              // 모든 Detail 컴포넌트가 scanUrl?: string props를 받아도 되도록 통일
              <DetailComponent
                results={issueResults}
                scanUrl={scanDetail.url}
              />
            ) : (
              <div className="py-12 text-center">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  문제가 발견되지 않았습니다!
                </h3>
                <p className="text-gray-600">
                  {categoryInfo.title} 항목은 모든 요소가 접근성 기준을 준수하고
                  있습니다.
                </p>
                <Button onClick={() => navigate("/dashboard")} className="mt-4">
                  대시보드로 돌아가기
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityScanDetailPage;
