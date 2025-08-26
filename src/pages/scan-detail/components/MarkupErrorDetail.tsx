import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";
import type { MarkupErrorResult } from "@/features/api/scanApi";

type Props = { results: MarkupErrorResult[]; scanUrl?: string };

const MarkupErrorDetail = ({ results }: Props) => {
  return (
    <div className="space-y-4">
      <div className="p-4 mb-6 border rounded-lg bg-violet-50 border-violet-200">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-bold text-md text-violet-700">
            [ 마크업 오류 방지 ] 수정 가이드
          </span>
        </div>
      </div>

      {results.map((result, index) => (
        <Card key={result.id} className="border-l-4 border-l-red-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                오류 항목 {index + 1}
              </CardTitle>
              <Badge
                className={
                  result.compliant
                    ? "text-green-600 bg-green-50"
                    : "text-red-600 bg-red-50"
                }
              >
                {result.compliant ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-1" />
                    준수
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-1" />
                    미준수 ({result.total_errors}개 오류)
                  </>
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-500">
                검사 결과
              </label>
              <div className="p-2 mt-1 text-sm rounded bg-gray-50">
                {result.message}
              </div>
            </div>

            {result.total_errors > 0 && (
              <div>
                <label className="text-xs font-medium text-gray-500">
                  총 오류 수
                </label>
                <div className="mt-1 text-lg font-semibold text-red-600">
                  {result.total_errors}개
                </div>
              </div>
            )}

            {result.error_details && result.error_details.length > 0 && (
              <div>
                <label className="text-xs font-medium text-gray-500">
                  오류 상세
                </label>
                <div className="mt-1 space-y-1">
                  {result.error_details.map((error, idx) => (
                    <div
                      key={idx}
                      className="p-2 text-sm text-red-700 rounded bg-red-50"
                    >
                      {error}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MarkupErrorDetail;
