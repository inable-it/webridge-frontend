import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";
import type { ContrastResult } from "@/features/api/scanApi";

type Props = { results: ContrastResult[]; scanUrl?: string };

const ContrastDetail = ({ results }: Props) => {
  return (
    <div className="space-y-4">
      <div className="p-4 mb-6 border border-blue-200 rounded-lg bg-blue-50">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-bold text-blue-700 text-md">
            [ 텍스트 콘텐츠의 명도 대비 ] 수정 가이드
          </span>
        </div>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold">
            ℹ️ WEBridge는 [텍스트 콘텐츠의 명도대비] 미준수 여부를 다음 기준으로
            확인해요.
          </span>
        </div>
        <ul className="space-y-1 text-sm">
          <li>• 텍스트 콘텐츠와 배경 간의 명도 대비가 4.5 대 1 미만인 경우</li>
        </ul>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold">
            ℹ️ 오류 항목을 수정하기 위해 아래 내용을 준수해야 해요.
          </span>
        </div>
        <ul className="space-y-1 text-sm">
          <li>
            • 텍스트 콘텐츠(텍스트 및 텍스트 이미지)와 배경 간의 명도 대비가 4.5
            대 1 이상이 되도록 색상을 사용해야 해요.
          </li>
        </ul>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold">
            💡 WEBridge 검사 이외에 이런 점도 고려해야 해요.
          </span>
        </div>
        <ul className="space-y-1 text-sm">
          <li>
            • 굵은 텍스트 폰트(18pt 이상 또는 14pt 이상)를 이용한다면 명도
            대비를 3 대 1까지 낮출 수 있어요.
          </li>
          <li>
            • 화면 확대가 가능한 텍스트 콘텐츠라면 명도 대비를 3 대 1까지 낮출
            수 있어요.
          </li>
          <li>
            • 로고, 장식 목적의 콘텐츠, 마우스나 키보드를 활용하여 초점을 받았을
            때 명도 대비가 커지는 콘텐츠 등은 예외로 해요.
          </li>
        </ul>
      </div>

      {results.map((result, index) => (
        <Card key={result.id} className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                오류 항목 {index + 1}
              </CardTitle>
              <Badge
                className={
                  result.wcag_compliant
                      ? "text-green-600 border-green-300"
                      : "text-red-600 border-red-300"
                }
              >
                {result.wcag_compliant ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-1" />
                    WCAG 준수
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-1" />
                    WCAG 미준수
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
                  전경색
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <div
                    className="w-6 h-6 border rounded"
                    style={{ backgroundColor: result.foreground_color }}
                  ></div>
                  <span className="font-mono text-sm">
                    {result.foreground_color}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700">
                  배경색
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <div
                    className="w-6 h-6 border rounded"
                    style={{ backgroundColor: result.background_color }}
                  ></div>
                  <span className="font-mono text-sm">
                    {result.background_color}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 border border-purple-200 rounded bg-purple-50">
              <div className="mb-1 text-xs font-medium text-purple-700">
                대비율 분석
              </div>
              <div className="text-lg font-bold text-purple-800">
                {result.contrast_ratio.toFixed(2)}:1
              </div>
              <div className="mt-1 text-xs text-purple-600">
                {result.wcag_compliant
                  ? "✓ WCAG 기준 (4.5:1) 이상입니다"
                  : "✗ WCAG 기준 (4.5:1) 미만입니다"}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ContrastDetail;
