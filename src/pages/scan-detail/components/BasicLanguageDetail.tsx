import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { BasicLanguageResult } from "@/features/api/scanApi";

type Props = { results: BasicLanguageResult[]; scanUrl?: string };

export const isBasicLanguageCompliant = (r: any): boolean => {
  if (typeof r?.compliant === "boolean") return r.compliant;
  return Boolean(r?.lang_attribute && String(r.lang_attribute).trim());
};

const BasicLanguageDetail = ({ results }: Props) => {
  const [filter, setFilter] = useState<"compliant" | "non-compliant">("non-compliant");
  const [expandedMap, setExpandedMap] = useState<Record<number | string, boolean>>({});

  const filteredResults = results.filter((result) => {
    const isCompliant = isBasicLanguageCompliant(result);
    return filter === "compliant" ? isCompliant : !isCompliant;
  });

  const toggleExpand = (key: number | string) => {
    setExpandedMap((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      {/* 수정 가이드 (피그마: 별도 카드 박스) */}
      <div className="p-6 bg-white border border-[#727272] rounded-lg shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          수정 가이드
        </h3>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-bold text-gray-900">
            ℹ️ WEBridge는 [기본 언어 표시] 미준수 여부를 다음 기준으로 확인해요.
          </span>
        </div>
        <ul className="space-y-1 text-sm text-gray-800">
          <li>• 웹 페이지의 기본 언어 표시가 명시되어 있지 않은 경우</li>
        </ul>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold text-gray-900">
            ℹ️ 오류 항목을 수정하기 위해 아래 내용을 준수해야 해요.
          </span>
        </div>
        <ul className="space-y-1 text-sm text-gray-800">
          <li>
            • 웹 페이지에서 제공하는 콘텐츠에 적용되는 기본 언어를 반드시
            정의해야 해요.
          </li>
          <li>
            • 기본 언어 표시는 HTML 태그에 lang 속성을 사용하여 &quot;ISO639-1&quot;에서
            지정한 두 글자로 된 언어 코드로 제공할 수 있어요.
          </li>
        </ul>
      </div>

      {/* 검사 결과 상세 (피그마: 별도 카드 박스) */}
      <div className="p-6 bg-white border border-[#727272] rounded-lg shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          검사 결과 상세
        </h3>

        {/* 필터 버튼 (피그마: 준수 / 미준수) */}
        <div className="flex gap-2 mb-6" role="group" aria-label="검사 결과 필터">
          <Button
            size="sm"
            aria-pressed={filter === "compliant"}
            onClick={() => setFilter("compliant")}
            className={`text-xs px-4 rounded-md ${
              filter === "compliant"
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-[#6B7280] hover:bg-[#5B6270] text-white"
            }`}
          >
            준수
          </Button>
          <Button
            size="sm"
            aria-pressed={filter === "non-compliant"}
            onClick={() => setFilter("non-compliant")}
            className={`text-xs px-4 rounded-md ${
              filter === "non-compliant"
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-[#6B7280] hover:bg-[#5B6270] text-white"
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
              const htmlCode = r?.element_html || "";

              return (
                <div key={itemKey} className="flex items-start gap-3">
                  {/* 좌측 순번 박스 */}
                  <div className="flex items-center justify-center w-8 h-8 text-sm font-medium text-gray-900 bg-white border border-[#727272] rounded shrink-0">
                    {index + 1}
                  </div>

                  {/* 우측 결과 카드 */}
                  <div className="flex-1 p-5 bg-white border border-[#727272] rounded-lg">
                    {/* 1: 기본언어 표시 HTML 소스 코드 + 더보기 */}
                    <div className="flex items-center justify-between gap-4 p-4 bg-white border border-gray-300 rounded min-h-[84px]">
                      <div
                        className={`flex-1 font-mono text-xs text-gray-800 break-all whitespace-pre-wrap ${
                          isExpanded ? "" : "line-clamp-3"
                        }`}
                      >
                        {htmlCode || "html 코드"}
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleExpand(itemKey)}
                        className="text-xs font-medium text-gray-600 underline-offset-2 hover:text-gray-900 hover:underline shrink-0"
                      >
                        {isExpanded ? "접기" : "더보기"}
                      </button>
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

export default BasicLanguageDetail;
