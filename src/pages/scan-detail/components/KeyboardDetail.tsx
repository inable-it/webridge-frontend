import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";
import type { KeyboardResult } from "@/features/api/scanApi";

type Props = { results: KeyboardResult[]; scanUrl?: string };

const KeyboardDetail = ({ results }: Props) => {
  return (
    <div className="space-y-4">
      <div className="p-4 mb-6 border border-blue-200 rounded-lg bg-blue-50">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-bold text-blue-700 text-md">
            [ 키보드 사용 보장 ] 수정 가이드
          </span>
        </div>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold">
            ℹ️ WEBridge는 [키보드 사용 보장] 미준수 여부를 다음 기준으로
            확인해요.
          </span>
        </div>
        <ul className="space-y-1 text-sm">
          <li>• 웹 사이트 내 Tab 키로 접근이 불가능한 요소가 있는 경우</li>
        </ul>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold">
            ℹ️ 오류 항목을 수정하기 위해 아래 내용을 준수해야 해요.
          </span>
        </div>
        <ul className="space-y-1 text-sm">
          <li>
            • 웹 페이지에서 제공하는 모든 기능은 Tab키로 접근이 가능해야 해요.
          </li>
          <li>
            • 예: 마우스 오버 시 드롭 다운 메뉴가 노출되는 경우, 키보드 접근
            시에도 드롭 다운 메뉴가 노출되고 메뉴에 접근 가능하도록 구현해야 함
          </li>
        </ul>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold">
            💡 WEBridge 검사 이외에 이런 점도 고려해야 해요.
          </span>
        </div>
        <ul className="space-y-1 text-sm">
          <li>
            • 모든 기능은 키보드만으로도 사용할 수 있어야 하며, Tab 키를 이용한
            이동뿐 아니라 클릭과 같은 동작도 키보드로 실행할 수 있어야 해요.
          </li>
          <li>
            • 위치 지정 도구의 커서 궤적이 중요한 역할을 하거나, 움직임 측정
            센서를 이용하는 콘텐츠는 검사항목의 예외 콘텐츠로 간주해요.
          </li>
          <li>
            • 예외 콘텐츠의 경우에도 해당 기능을 제외한 나머지 사용자
            인터페이스는 키보드만으로도 사용할 수 있어야 해요.
          </li>
        </ul>
      </div>

      {results.map((result, index) => (
        <Card key={result.id} className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                오류 항목 {index + 1} - {result.element_type}
              </CardTitle>
              <Badge
                className={
                  result.accessible
                      ? "text-green-600 border-green-300"
                      : "text-red-600 border-red-300"
                }
              >
                {result.accessible ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-1" />
                    접근 가능
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-1" />
                    접근 불가
                  </>
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div>
              <label className="text-xs font-medium text-gray-700">
                검사 결과
              </label>
              <div className="p-2 mt-1 text-sm break-all whitespace-pre-wrap rounded bg-gray-50 border border-[#727272]">
                {result.element_html}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default KeyboardDetail;
