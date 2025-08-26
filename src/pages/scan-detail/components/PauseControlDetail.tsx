import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";
import type { PauseControlResult } from "@/features/api/scanApi";

type Props = { results: PauseControlResult[]; scanUrl?: string };

const PauseControlDetail = ({ results }: Props) => {
  return (
    <div className="space-y-4">
      <div className="p-4 mb-6 border border-yellow-200 rounded-lg bg-yellow-50">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-bold text-yellow-700 text-md">
            [ 정지 기능 제공 ] 수정 가이드
          </span>
        </div>
      </div>

      {results.map((result, index) => (
        <Card key={result.id} className="border-l-4 border-l-amber-500">
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
                  자동 콘텐츠 발견
                </label>
                <div className="mt-1 text-lg font-semibold">
                  {result.auto_elements_found}개
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500">
                  정지 기능 없음
                </label>
                <div className="mt-1 text-lg font-semibold text-red-600">
                  {result.elements_without_pause}개
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PauseControlDetail;
