import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";
import type { FlashingResult } from "@/features/api/scanApi";

type Props = { results: FlashingResult[]; scanUrl?: string };

const FlashingDetail = ({ results }: Props) => {
  return (
    <div className="space-y-4">
      <div className="p-4 mb-6 border border-blue-200 rounded-lg bg-blue-50">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-bold text-blue-700 text-md">
            [ 깜빡임과 번쩍임 사용 제한 ] 수정 가이드
          </span>
        </div>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold">
            ℹ️ WEBridge는 [깜빡임과 번쩍임 사용 제한] 미준수 여부를 다음
            기준으로 확인해요.
          </span>
        </div>
        <ul className="space-y-1 text-sm">
          <li>• 초당 3~50회의 속도로 번쩍이는 콘텐츠가 있는 경우</li>
        </ul>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold">
            ℹ️ 오류 항목을 수정하기 위해 아래 내용을 준수해야 해요.
          </span>
        </div>
        <ul className="space-y-1 text-sm">
          <li>
            • 초당 3~50회로 깜빡이는 콘텐츠는 깜빡임을 정지할 수 있는 기능을
            제공해야 해요.
          </li>
          <li>
            • 번쩍임이 초당 3~50회일 경우, 10인치 이상 화면에서 해당 콘텐츠가
            차지하는 면적 합은 화면 전체의 10%를 넘지 않아야 해요.
          </li>
          <li>• 콘텐츠의 번쩍임 지속 시간은 3초 미만으로 제한해야 해요.</li>
        </ul>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold">
            💡 WEBridge 검사 이외에 이런 점도 고려해야 해요.
          </span>
        </div>
        <ul className="space-y-1 text-sm">
          <li>
            • 10인치 이상 화면을 사용하는 기기(예: 태블릿, PC 모니터, 무인
            안내기 등)에서는 광과민성 발작 유발 가능성에 특히 주의해야 해요.
          </li>
        </ul>
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
              <label className="text-xs font-medium text-gray-700">
                검사 결과
              </label>
              <div className="p-2 mt-1 text-sm break-all whitespace-pre-wrap rounded bg-gray-50">
                {result.element_html}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FlashingDetail;
