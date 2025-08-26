import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";
import type { BasicLanguageResult } from "@/features/api/scanApi";

type Props = { results: BasicLanguageResult[]; scanUrl?: string };

const BasicLanguageDetail = ({ results }: Props) => {
  return (
    <div className="space-y-4">
      <div className="p-4 mb-6 border rounded-lg bg-sky-50 border-sky-200">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-bold text-md text-sky-700">
            [ 기본 언어 표시 ] 수정 가이드
          </span>
        </div>
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
              <label className="text-xs font-medium text-gray-500">
                검사 결과
              </label>
              <div className="p-2 mt-1 text-sm rounded bg-gray-50">
                {result.message}
              </div>
            </div>
            {result.lang_attribute && (
              <div className="mt-3">
                <label className="text-xs font-medium text-gray-500">
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
