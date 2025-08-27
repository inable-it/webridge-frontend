import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";
import type { MarkupErrorResult } from "@/features/api/scanApi";

type Props = { results: MarkupErrorResult[]; scanUrl?: string };

const MarkupErrorDetail = ({ results }: Props) => {
  return (
    <div className="space-y-4">
      <div className="p-4 mb-6 border border-blue-200 rounded-lg bg-blue-50">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-bold text-blue-700 text-md">
            [ 마크업 오류 방지 ] 수정 가이드
          </span>
        </div>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold">
            ℹ️ WEBridge는 [마크업 오류 방지] 미준수 여부를 다음 기준으로
            확인해요.
          </span>
        </div>
        <ul className="space-y-1 text-sm">
          <li>• 중복된 속성을 사용한 경우</li>
          <li>• id 속성값을 중복으로 사용한 경우</li>
        </ul>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold">
            ℹ️ 오류 항목을 수정하기 위해 아래 내용을 준수해야 해요.
          </span>
        </div>
        <ul className="space-y-1 text-sm">
          <li>
            • 마크업 언어로 작성된 콘텐츠는 해당 마크업 언어의 문법을 최대한
            준수하여 제공해야 해요.
          </li>
          <li>• 요소의 속성도 마크업 문법을 최대한 준수하여 제공해야 해요.</li>
          <li>• 요소의 열고 닫음, 중첩 관계의 오류가 없도록 제공해야 해요.</li>
          <li>
            • 중복된 속성 사용 금지: 하나의 요소 안에서 속성을 중복하여 선언하지
            않아야 해요.
          </li>
          <li>
            • id 속성값 중복 선언 금지: 하나의 마크업 문서에서는 같은 id값을
            중복하여 선언하지 않아야 해요.
          </li>
        </ul>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold">
            💡 WEBridge 검사 이외에 이런 점도 고려해야 해요.
          </span>
        </div>
        <ul className="space-y-1 text-sm">
          <li>
            • 요소의 열고 닫음 일치: 마크업 언어로 작성된 콘텐츠는 표준에서
            특별히 정한 경우를 제외하고 시작 요소와 끝나는 요소가 정의되어야
            해요.
          </li>
          <li>
            • 요소의 중첩 방지: 시작 요소와 끝나는 요소의 나열 순서는 포함
            관계가 어긋나지 않아야 해요.
          </li>
        </ul>
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
              <div className="p-2 mt-1 text-sm break-all whitespace-pre-wrap rounded bg-gray-50">
                {result.element_html}
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
                      {error.message}
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
