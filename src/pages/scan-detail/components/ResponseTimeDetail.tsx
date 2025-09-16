import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";
import type { ResponseTimeResult } from "@/features/api/scanApi";

type Props = { results: ResponseTimeResult[]; scanUrl?: string };

const ResponseTimeDetail = ({ results }: Props) => {
  return (
    <div className="space-y-4">
      <div className="p-4 mb-6 border border-blue-200 rounded-lg bg-blue-50">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-bold text-blue-700 text-md">
            [ 응답 시간 조절 ] 수정 가이드
          </span>
        </div>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold">
            ℹ️ WEBridge는 [응답 시간 조절] 미준수 여부를 다음 기준으로 확인해요.
          </span>
        </div>
        <ul className="space-y-1 text-sm">
          <li>• 시간 제한 콘텐츠가 존재하는 경우</li>
        </ul>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold">
            ℹ️ 오류 항목을 수정하기 위해 아래 내용을 준수해야 해요.
          </span>
        </div>
        <ul className="space-y-1 text-sm">
          <li>• 시간 제한이 있는 콘텐츠는 제공하지 않아야 해요.</li>
          <li>
            • 반응 시간이 정해진 콘텐츠를 제공해야 하는 경우, 최소 20초 이상의
            시간을 부여하고 사전에 반응 시간 조절 방법을 안내해야 해요.
          </li>
          <li>
            • 시간 제한을 해제하거나 연장할 수 있는 선택지를 제공하여 사용자가
            반응 시간을 조절할 수 있도록 해야 해요.
          </li>
        </ul>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold">
            💡 WEBridge 검사 이외에 이런 점도 고려해야 해요.
          </span>
        </div>
        <ul className="space-y-1 text-sm">
          <li>
            • 반응 시간 조절이 원천적으로 불가능한 경우(예: 온라인 경매, 실시간
            게임)는 본 검사 항목이 적용되지 않아요.
          </li>
          <li>
            • 검사 항목에 해당하지 않더라도, 사용자에게 시간 제한이 있다는
            사실과 종료 시점을 반드시 알려주어야 해요.
          </li>
          <li>• 세션 시간이 20시간 이상인 콘텐츠는 예외로 간주돼요.</li>
        </ul>
      </div>

      {results.map((result, index) => (
        <Card key={result.id} className="border-l-4 border-l-cyan-500">
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
              <div className="p-2 mt-1 text-sm break-all whitespace-pre-wrap rounded bg-gray-50 border border-[#727272]">
                {result.element_html}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-700">
                  시간 제한 여부
                </label>
                <div className="flex items-center gap-2 mt-1">
                  {result.has_time_limit ? (
                    <XCircle className="w-4 h-4 text-red-600" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  )}
                  <span className="text-sm">
                    {result.has_time_limit
                      ? "시간 제한 있음"
                      : "시간 제한 없음"}
                  </span>
                </div>
              </div>

              {result.short_timeouts > 0 && (
                <div>
                  <label className="text-xs font-medium text-gray-700">
                    짧은 시간 제한
                  </label>
                  <div className="mt-1 text-lg font-semibold text-red-600">
                    {result.short_timeouts}개
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ResponseTimeDetail;
