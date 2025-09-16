import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";
import type { TableResult } from "@/features/api/scanApi";

type Props = { results: TableResult[]; scanUrl?: string };

const TableDetail = ({ results }: Props) => {
  return (
    <div className="space-y-4">
      <div className="p-4 mb-6 border border-blue-200 rounded-lg bg-blue-50">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-bold text-blue-700 text-md">
            [ 표의 구성 ] 수정 가이드
          </span>
        </div>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold">
            ℹ️ WEBridge는 [표의 구성] 미준수 여부를 다음 기준으로 확인해요.
          </span>
        </div>
        <ul className="space-y-1 text-sm">
          <li>• 표의 제목 셀과 데이터 셀이 구분되지 않은 경우</li>
        </ul>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold">
            ℹ️ 오류 항목을 수정하기 위해 아래 내용을 준수해야 해요.
          </span>
        </div>
        <ul className="space-y-1 text-sm">
          <li>• 제목 셀은 th로 내용 셀은 td로 마크업 해야 해요.</li>
          <li>
            • 제목 셀이 행과 열에 모두 있는 경우 scope로 행 제목인지 열 제목인지
            구분해야 해요.
          </li>
          <li>
            • 복잡한 표의 경우 id와 headers 속성을 이용하면 제목 셀과 내용 셀을
            정확하게 연결할 수 있어요.
          </li>
        </ul>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold">
            💡 WEBridge 검사 이외에 이런 점도 고려해야 해요.
          </span>
        </div>
        <ul className="space-y-1 text-sm">
          <li>
            • 표의 내용, 구조 등 표의 정보를 제공하여 표의 이용 방법을 예측할 수
            있도록 해야 해요.
          </li>
          <li>
            • caption으로 제목을, table의 summary 속성으로 요약 정보를 제공해야
            해요.
          </li>
          <li>
            • 마크업 시 데이터 테이블과, 레이아웃 테이블이 혼동되지 않도록
            유의해야 해요.
          </li>
        </ul>
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
                      ? "text-green-600 border-green-300"
                      : "text-red-600 border-red-300"
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
                <label className="text-xs font-medium text-gray-700">
                  헤더 수
                </label>
                <div className="mt-1 text-lg font-semibold">
                  {result.headers_count}개
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700">
                  행 수
                </label>
                <div className="mt-1 text-lg font-semibold">
                  {result.rows_count}개
                </div>
              </div>
            </div>

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

export default TableDetail;
