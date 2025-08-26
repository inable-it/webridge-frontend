import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";
import type { HeadingResult } from "@/features/api/scanApi";

type Props = { results: HeadingResult[]; scanUrl?: string };

const HeadingDetail = ({ results }: Props) => {
  return (
    <div className="space-y-4">
      <div className="p-4 mb-6 border rounded-lg bg-emerald-50 border-emerald-200">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-bold text-md text-emerald-700">
            [ 제목 제공 ] 수정 가이드
          </span>
        </div>
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
              <div className="p-2 mt-1 text-sm rounded bg-gray-50">
                {result.message}
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
