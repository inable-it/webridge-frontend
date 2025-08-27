import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";
import type { HeadingResult } from "@/features/api/scanApi";

type Props = { results: HeadingResult[]; scanUrl?: string };

const HeadingDetail = ({ results }: Props) => {
  return (
    <div className="space-y-4">
      <div className="p-4 mb-6 border border-blue-200 rounded-lg bg-blue-50">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-bold text-blue-700 text-md">
            [ 제목 제공 ] 수정 가이드
          </span>
        </div>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold">
            ℹ️ WEBridge는 [제목 제공] 미준수 여부를 다음 기준으로 확인해요.
          </span>
        </div>
        <ul className="space-y-1 text-sm">
          <li>• 웹 페이지, 팝업창, 프레임에 제목이 존재하지 않는 경우</li>
          <li>• !!!, ???, *** 등 불필요한 특수 기호를 반복 사용한 경우</li>
        </ul>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold">
            ℹ️ 오류 항목을 수정하기 위해 아래 내용을 준수해야 해요.
          </span>
        </div>
        <ul className="space-y-1 text-sm">
          <li>
            • 제목은 간결하고 명확하게 작성하며, 해당 페이지·프레임·콘텐츠
            블록의 내용을 유추할 수 있도록 해야 해요.
          </li>
          <li>• 웹 페이지는 유일하고 서로 다른 제목(title)을 제공해야 해요.</li>
          <li>• 팝업창에도 제목(title)을 제공해야 해요.</li>
          <li>
            • 프레임에도 제목(title)을 제공해야 하며, 내용이 없을 경우 ‘빈
            프레임’과 같이 표시해야 해요.
          </li>
          <li>
            • 제목 작성 시 불필요한 특수 기호를 반복 사용하지 않아야 해요.
          </li>
        </ul>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold">
            💡 WEBridge 검사 이외에 이런 점도 고려해야 해요.
          </span>
        </div>
        <ul className="space-y-1 text-sm">
          <li>
            • 콘텐츠 블록에도 적절한 제목(heading)을 제공하되, 본문이 없는
            블록에는 제목을 붙이지 않아야 해요.
          </li>
        </ul>
      </div>

      {results.map((result, index) => (
        <Card key={result.id} className="border-l-4 border-l-yellow-500">
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
                    미준수 ({result.total_issues}개 문제)
                  </>
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 rounded bg-blue-50">
              <h4 className="mb-2 text-sm font-medium text-blue-800">
                페이지 제목
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  {result.page_title_exists ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span>제목 존재</span>
                </div>
                <div className="flex items-center gap-2">
                  {!result.page_title_empty ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span>내용 있음</span>
                </div>
              </div>
              {result.page_title_text && (
                <div className="mt-2">
                  <label className="text-xs font-medium text-blue-700">
                    제목 내용
                  </label>
                  <div className="p-2 mt-1 text-sm bg-white rounded">
                    "{result.page_title_text}" ({result.page_title_length}자)
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500">
                종합 검사 결과
              </label>
              <div className="p-2 mt-1 text-sm break-all whitespace-pre-wrap rounded bg-gray-50">
                {result.element_html}
              </div>
            </div>

            {result.issues_details && result.issues_details.length > 0 && (
              <div>
                <label className="text-xs font-medium text-gray-500">
                  문제 상세 내역
                </label>
                <div className="mt-1 space-y-1">
                  {result.issues_details.map((issue, idx) => (
                    <div
                      key={idx}
                      className="p-2 text-sm text-red-700 rounded bg-red-50"
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

export default HeadingDetail;
