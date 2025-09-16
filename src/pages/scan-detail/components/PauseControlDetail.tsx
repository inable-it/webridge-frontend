import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";
import type { PauseControlResult } from "@/features/api/scanApi";

type Props = { results: PauseControlResult[]; scanUrl?: string };

const PauseControlDetail = ({ results }: Props) => {
  return (
    <div className="space-y-4">
      <div className="p-4 mb-6 border border-blue-200 rounded-lg bg-blue-50">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-bold text-blue-700 text-md">
            [ 정지 기능 제공 ] 수정 가이드
          </span>
        </div>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold">
            ℹ️ WEBridge는 [ 정지 기능 제공 ] 미준수 여부를 다음 기준으로
            확인해요.
          </span>
        </div>
        <ul className="space-y-1 text-sm">
          <li>• 스크롤 및 자동 갱신되는 콘텐츠를 정지할 수 없는 경우</li>
        </ul>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold">
            ℹ️ 오류 항목을 수정하기 위해 아래 내용을 준수해야 해요.
          </span>
        </div>
        <ul className="space-y-1 text-sm">
          <li>
            • 스크롤 및 자동 갱신되는 콘텐츠의 사용을 배제하는 것이 좋아요.
          </li>
          <li>
            • 스크롤 및 자동 갱신되는 콘텐츠를 사용할 경우 제어 기능(예: 정지,
            앞으로 이동, 뒤로 이동)을 제공해야 해요.
          </li>
        </ul>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold">
            💡 WEBridge 검사 이외에 이런 점도 고려해야 해요.
          </span>
        </div>
        <ul className="space-y-1 text-sm">
          <li>• 제어 기능이 정상적으로 작동하는지 테스트해야 해요.</li>
        </ul>
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
                      ? "text-green-600 border-green-300"
                      : "text-red-600 border-red-300"
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
              <label className="text-xs font-medium text-gray-700">
                검사 결과
              </label>
              <div className="p-2 mt-1 text-sm rounded bg-gray-50">
                {result.element_html}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-700">
                  자동 콘텐츠 발견
                </label>
                <div className="mt-1 text-lg font-semibold">
                  {result.auto_elements_found}개
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700">
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
