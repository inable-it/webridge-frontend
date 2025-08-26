import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";
import type { FlashingResult } from "@/features/api/scanApi";

type Props = { results: FlashingResult[]; scanUrl?: string };

const FlashingDetail = ({ results }: Props) => {
  return (
    <div className="space-y-4">
      <div className="p-4 mb-6 border border-gray-200 rounded-lg bg-gray-50">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-bold text-gray-700 text-md">
            [ 깜빡임과 번쩍임 사용 제한 ] 수정 가이드
          </span>
        </div>
      </div>

      {results.map((result, index) => (
        <Card key={result.id} className="border-l-4 border-l-rose-500">
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
                    미준수
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500">
                  깜빡임 요소
                </label>
                <div className="mt-1 text-lg font-semibold">
                  {result.flashing_elements_count}개
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500">
                  깜빡임 스크립트
                </label>
                <div className="flex items-center gap-2 mt-1">
                  {result.has_flashing_script ? (
                    <XCircle className="w-4 h-4 text-red-600" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  )}
                  <span className="text-sm">
                    {result.has_flashing_script ? "발견됨" : "없음"}
                  </span>
                </div>
              </div>
            </div>

            {result.issue_details && result.issue_details.length > 0 && (
              <div>
                <label className="text-xs font-medium text-gray-500">
                  문제 상세
                </label>
                <div className="mt-1 space-y-1">
                  {result.issue_details.map((issue, idx) => (
                    <div
                      key={idx}
                      className="p-2 text-sm rounded bg-rose-50 text-rose-700"
                    >
                      {issue}
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

export default FlashingDetail;
