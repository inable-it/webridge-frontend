import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { HeadingResult } from "@/features/api/scanApi";

type Props = { results: HeadingResult[]; scanUrl?: string };

export const isHeadingCompliant = (r: any): boolean => {
  if (typeof r?.compliant === "boolean") return r.compliant;
  return typeof r?.total_issues === "number" ? r.total_issues === 0 : false;
};

/**
 * 제목 제공 결과에서 제목명 요약 텍스트 추출
 * - 미준수 등으로 제목 추출이 어려운 경우 상세설명에 따라 공란("") 반환
 */
const getHeadingTitleSummary = (r: any): string => {
  const explicit =
    r?.title_summary ||
    r?.heading_text ||
    r?.title_text ||
    r?.page_title_text ||
    r?.title;
  if (typeof explicit === "string" && explicit.trim()) {
    return explicit.replace(/\s+/g, " ").trim();
  }

  if (typeof r?.element_html === "string" && r.element_html.trim()) {
    const html = r.element_html;
    // <title>...</title> 직접 추출
    const titleTagMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (titleTagMatch?.[1]?.trim()) {
      return titleTagMatch[1].replace(/\s+/g, " ").trim();
    }

    try {
      const doc = new DOMParser().parseFromString(html, "text/html");
      const docTitle = doc.querySelector("title")?.textContent?.trim();
      if (docTitle) {
        return docTitle.replace(/\s+/g, " ").trim();
      }

      const headingEl = doc.body.querySelector("h1, h2, h3, h4, h5, h6");
      if (headingEl?.textContent?.trim()) {
        return headingEl.textContent.replace(/\s+/g, " ").trim();
      }

      const frameEl =
        doc.body.querySelector("iframe, frame") ?? doc.body.firstElementChild;
      if (frameEl) {
        const attrTitle =
          frameEl.getAttribute("title") || frameEl.getAttribute("aria-label");
        if (attrTitle?.trim()) {
          return attrTitle.replace(/\s+/g, " ").trim();
        }
        const text = frameEl.textContent?.replace(/\s+/g, " ").trim();
        if (text) return text;
      }
    } catch {
      // ignore parse failure
    }
  }

  return "";
};

const HeadingDetail = ({ results }: Props) => {
  const [filter, setFilter] = useState<"compliant" | "non-compliant">("non-compliant");
  const [expandedMap, setExpandedMap] = useState<Record<number | string, boolean>>({});

  const filteredResults = results.filter((result) => {
    const isCompliant = isHeadingCompliant(result);
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
              ℹ️ WEBridge는 [제목 제공] 미준수 여부를 다음 기준으로 확인해요.
            </span>
          </div>
          <ul className="space-y-1 text-sm text-gray-800">
            <li>• 웹 페이지, 팝업창, 프레임에 제목이 존재하지 않는 경우</li>
            <li>• !!!, ???, *** 등 불필요한 특수 기호를 반복 사용한 경우</li>
          </ul>
          <div className="flex items-center gap-2 mt-4 mb-2">
            <span className="text-sm font-bold text-gray-900">
              ℹ️ 오류 항목을 수정하기 위해 아래 내용을 준수해야 해요.
            </span>
          </div>
          <ul className="space-y-1 text-sm text-gray-800">
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
            <span className="text-sm font-bold text-gray-900">
              💡 WEBridge 검사 이외에 이런 점도 고려해야 해요.
            </span>
          </div>
          <ul className="space-y-1 text-sm text-gray-800">
            <li>
              • 콘텐츠 블록에도 적절한 제목(heading)을 제공하되, 본문이 없는
              블록에는 제목을 붙이지 않아야 해요.
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
              const htmlCode = r?.element_html || "";
              const titleSummary = getHeadingTitleSummary(r);

              return (
                <div key={itemKey} className="flex items-start gap-3">
                  {/* 좌측 순번 배지 */}
                  <div className="flex items-center justify-center w-6 h-6 text-xs font-semibold text-white rounded bg-[#6B7280] shrink-0">
                    {index + 1}
                  </div>

                  {/* 우측 결과 카드 */}
                  <div className="flex-1 p-5 space-y-3 bg-white border border-gray-300 rounded-lg">
                    {/* 2: 제목명 요약 정보 배지 (미준수 등으로 추출 불가 시 공란 처리) */}
                    <div>
                      <span className="inline-flex items-center px-4 py-1.5 text-xs font-medium text-white rounded-md bg-[#6B7280]">
                        제목명 :{titleSummary ? ` ${titleSummary}` : ""}
                      </span>
                    </div>

                    {/* 1: 제목제공 HTML 소스 코드 + 더보기 */}
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

export default HeadingDetail;
