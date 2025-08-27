import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";
import type { LabelResult } from "@/features/api/scanApi";

type Props = { results: LabelResult[]; scanUrl?: string };

const LabelDetail = ({ results }: Props) => {
  return (
    <div className="space-y-4">
      <div className="p-4 mb-6 border border-blue-200 rounded-lg bg-blue-50">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-bold text-blue-700 text-md">
            [ 레이블 제공 ] 수정 가이드
          </span>
        </div>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold">
            ℹ️ WEBridge는 [레이블 제공] 미준수 여부를 다음 기준으로 확인해요.
          </span>
        </div>
        <ul className="space-y-1 text-sm">
          <li>• 입력 서식과 레이블이 1:1로 매칭되어 있지 않은 경우</li>
        </ul>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold">
            ℹ️ 오류 항목을 수정하기 위해 아래 내용을 준수해야 해요.
          </span>
        </div>
        <ul className="space-y-1 text-sm">
          <li>• 레이블과 사용자 입력 간의 관계를 대응시켜야 해요.</li>
          <li>
            • 레이블을 제공하고 label for 값과 input의 id 값을 동일하게 제공해야
            해요.
          </li>
        </ul>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold">
            💡 WEBridge 검사 이외에 이런 점도 고려해야 해요.
          </span>
        </div>
        <ul className="space-y-1 text-sm">
          <li>
            • 레이블과 입력 서식이 1:다 매칭인 경우 각 입력 서식에 대해 title을
            제공해야 해요.
          </li>
          <li>
            • 레이블이 시각적으로 노출되지 않은 경우 각 입력 서식에 대해 title을
            제공해야 해요.
          </li>
        </ul>
      </div>

      {results.map((result, index) => (
        <Card key={result.id} className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                오류 항목 {index + 1} - {result.input_type}
              </CardTitle>
              <Badge
                className={
                  result.label_present
                    ? "text-green-600 bg-green-50"
                    : "text-red-600 bg-red-50"
                }
              >
                {result.label_present ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-1" />
                    레이블 있음
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-1" />
                    레이블 없음
                  </>
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div>
              <label className="text-xs font-medium text-gray-500">
                검사 결과
              </label>
              <div className="p-2 mt-1 text-sm rounded bg-gray-50">
                {result.message}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default LabelDetail;
