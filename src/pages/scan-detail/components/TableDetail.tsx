import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";
import type { TableResult } from "@/features/api/scanApi";

type Props = { results: TableResult[]; scanUrl?: string };

const TableDetail = ({ results }: Props) => {
  return (
    <div className="space-y-4">
      <div className="p-4 mb-6 border border-purple-200 rounded-lg bg-purple-50">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-bold text-purple-700 text-md">
            [ 표의 구성 ] 수정 가이드
          </span>
        </div>
      </div>

      {results.map((result, index) => (
        <Card key={result.id} className="border-l-4 border-l-indigo-500">
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
                    구조 준수
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-1" />
                    구조 미준수
                  </>
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500">
                  헤더 수
                </label>
                <div className="mt-1 text-lg font-semibold">
                  {result.headers_count}개
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">
                  행 수
                </label>
                <div className="mt-1 text-lg font-semibold">
                  {result.rows_count}개
                </div>
              </div>
            </div>

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

export default TableDetail;
