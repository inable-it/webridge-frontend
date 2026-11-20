import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { TableResult } from "@/features/api/scanApi";

type Props = { results: TableResult[]; scanUrl?: string };

export const isTableCompliant = (r: any): boolean => {
  return Boolean(r?.compliant);
};

const toAbsoluteUrl = (rawUrl?: string, baseUrl?: string): string | null => {
  if (!rawUrl) return null;
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;
  try {
    if (
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://") ||
      trimmed.startsWith("data:")
    ) {
      return trimmed;
    }
    if (baseUrl) {
      return new URL(trimmed, new URL(baseUrl).origin).href;
    }
    return trimmed;
  } catch {
    return trimmed;
  }
};

const resolveTableCaptureUrl = (r: any, scanUrl?: string): string | null => {
  const raw =
    r?.screenshot_url ||
    r?.capture_url ||
    r?.thumbnail_url ||
    r?.img_url ||
    r?.image_url;
  return toAbsoluteUrl(raw, scanUrl);
};

const TableDetail = ({ results, scanUrl }: Props) => {
  const [filter, setFilter] = useState<"compliant" | "non-compliant">("non-compliant");
  const [expandedMap, setExpandedMap] = useState<Record<number | string, boolean>>({});
  const [failedPreviewMap, setFailedPreviewMap] = useState<Record<number | string, boolean>>({});

  const filteredResults = results.filter((result) => {
    const isCompliant = isTableCompliant(result);
    return filter === "compliant" ? isCompliant : !isCompliant;
  });

  const toggleExpand = (key: number | string) => {
    setExpandedMap((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-8">
      {/* 수정 가이드 섹션 */}
      <div>
        <h3 className="mb-3 text-xl font-bold text-gray-900">
          수정 가이드
        </h3>
        <div className="p-6 bg-[#F3F5F8] border border-gray-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-bold text-gray-900">
              ℹ️ WEBridge는 [표의 구성] 미준수 여부를 다음 기준으로 확인해요.
            </span>
          </div>
          <ul className="space-y-1 text-sm text-gray-800">
            <li>• 표의 제목 셀과 데이터 셀이 구분되지 않은 경우</li>
          </ul>
          <div className="flex items-center gap-2 mt-4 mb-2">
            <span className="text-sm font-bold text-gray-900">
              ℹ️ 오류 항목을 수정하기 위해 아래 내용을 준수해야 해요.
            </span>
          </div>
          <ul className="space-y-1 text-sm text-gray-800">
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
            <span className="text-sm font-bold text-gray-900">
              💡 WEBridge 검사 이외에 이런 점도 고려해야 해요.
            </span>
          </div>
          <ul className="space-y-1 text-sm text-gray-800">
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
      </div>

      {/* 검사 결과 상세 섹션 */}
      <div>
        <h3 className="mb-3 text-xl font-bold text-gray-900">
          검사 결과 상세
        </h3>

        {/* 필터 버튼 (공통: 준수 / 미준수) */}
        <div className="flex gap-2 mb-6" role="group" aria-label="검사 결과 필터">
          <Button
            size="sm"
            variant="outline"
            aria-pressed={filter === "compliant"}
            onClick={() => setFilter("compliant")}
            className={`text-xs px-3.5 py-1.5 h-8 rounded-md font-medium border ${
              filter === "compliant"
                ? "bg-[#2563EB] hover:bg-blue-700 text-white border-[#2563EB]"
                : "bg-white hover:bg-blue-50 text-[#2563EB] border-[#2563EB]"
            }`}
          >
            준수
          </Button>
          <Button
            size="sm"
            variant="outline"
            aria-pressed={filter === "non-compliant"}
            onClick={() => setFilter("non-compliant")}
            className={`text-xs px-3.5 py-1.5 h-8 rounded-md font-medium border ${
              filter === "non-compliant"
                ? "bg-[#2563EB] hover:bg-blue-700 text-white border-[#2563EB]"
                : "bg-white hover:bg-blue-50 text-[#2563EB] border-[#2563EB]"
            }`}
          >
            미준수
          </Button>
        </div>

        {filteredResults.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            <p>선택한 필터에 해당하는 항목이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredResults.map((result, index) => {
              const r = result as any;
              const itemKey = r.id ?? index;
              const isExpanded = !!expandedMap[itemKey];
              const previewFailed = !!failedPreviewMap[itemKey];
              const captureUrl = resolveTableCaptureUrl(r, scanUrl);
              const htmlCode = r?.element_html || "";

              return (
                <div key={itemKey} className="flex items-start gap-3">
                  {/* 좌측 순번 배지 */}
                  <div className="flex items-center justify-center w-6 h-6 text-xs font-semibold text-white rounded bg-[#6B7280] shrink-0">
                    {index + 1}
                  </div>

                  {/* 우측 결과 카드 */}
                  <div className="flex-1 p-5 bg-white border border-gray-300 rounded-lg">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
                      {/* 표 캡쳐본 */}
                      <div className="relative flex items-center justify-center w-full sm:w-56 min-h-[120px] px-3 text-center overflow-hidden rounded bg-[#D1D5DB] shrink-0">
                        {!previewFailed && captureUrl ? (
                          <img
                            src={captureUrl}
                            alt="표 캡쳐본"
                            className="object-cover w-full h-full"
                            onError={() =>
                              setFailedPreviewMap((prev) => ({
                                ...prev,
                                [itemKey]: true,
                              }))
                            }
                          />
                        ) : (
                          <span className="text-xs font-semibold text-gray-800">
                            표 캡쳐본
                          </span>
                        )}
                      </div>

                      {/* 표 HTML 소스 코드 + 더보기 */}
                      <div className="flex flex-col justify-between flex-1 p-3 bg-white border border-gray-300 rounded min-h-[120px]">
                        <div
                          className={`font-mono text-xs text-gray-800 break-all whitespace-pre-wrap ${
                            isExpanded ? "" : "line-clamp-4"
                          }`}
                        >
                          {htmlCode || "html 코드"}
                        </div>
                        <div className="flex justify-end mt-2">
                          <button
                            type="button"
                            onClick={() => toggleExpand(itemKey)}
                            className="text-xs font-medium text-gray-600 underline-offset-2 hover:text-gray-900 hover:underline"
                          >
                            {isExpanded ? "접기" : "더보기"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TableDetail;
