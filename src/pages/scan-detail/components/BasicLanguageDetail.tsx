import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";
import type { BasicLanguageResult } from "@/features/api/scanApi";

type Props = { results: BasicLanguageResult[]; scanUrl?: string };

const BasicLanguageDetail = ({ results }: Props) => {
  return (
    <div className="space-y-4">
      <div className="p-4 mb-6 border border-blue-200 rounded-lg bg-blue-50">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-bold text-blue-700 text-md">
            [ 기본 언어 표시 ] 수정 가이드
          </span>
        </div>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold">
            ℹ️ WEBridge는 [기본 언어 표시] 미준수 여부를 다음 기준으로 확인해요.
          </span>
        </div>
        <ul className="space-y-1 text-sm">
          <li>• 웹 페이지의 기본 언어 표시가 명시되어 있지 않은 경우</li>
        </ul>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold">
            ℹ️ 오류 항목을 수정하기 위해 아래 내용을 준수해야 해요.
          </span>
        </div>
        <ul className="space-y-1 text-sm">
          <li>
            • 웹 페이지에서 제공하는 콘텐츠에 적용되는 기본 언어를 반드시
            정의해야 해요.
          </li>
          <li>
            • 기본 언어 표시는 HTML 태그에 lang 속성을 사용하여 "ISO639-1"에서
            지정한 두 글자로 된 언어 코드로 제공할 수 있어요.
          </li>
        </ul>
      </div>

      {results.map((result, index) => (
        <Card key={result.id} className="border-l-4 border-l-teal-500">
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
          <CardContent>
            <div>
              <label className="text-xs font-medium text-gray-700">
                검사 결과
              </label>
              <div className="p-2 mt-1 text-sm break-all whitespace-pre-wrap rounded bg-gray-50 border border-[#727272]">
                {result.element_html}
              </div>
            </div>
            {result.lang_attribute && (
              <div className="mt-3">
                <label className="text-xs font-medium text-gray-700">
                  현재 언어 속성
                </label>
                <div className="p-2 mt-1 font-mono text-sm rounded bg-gray-50">
                  lang="{result.lang_attribute}"
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default BasicLanguageDetail;
