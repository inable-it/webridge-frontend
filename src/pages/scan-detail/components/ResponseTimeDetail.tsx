import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { ResponseTimeResult } from "@/features/api/scanApi";

type Props = { results: ResponseTimeResult[]; scanUrl?: string };

export const isResponseTimeCompliant = (r: any): boolean => {
  if (typeof r?.compliant === "boolean") return r.compliant;
  if (typeof r?.has_time_limit === "boolean") {
    return !r.has_time_limit && !(r?.short_timeouts > 0);
  }
  return false;
};

/**
 * 응답 시간 조절 대상 요소로부터 어떤 정보를 입력하는 데 제약을 거는지 요약 텍스트 추출
 * 예: "인증코드입력" 등
 */
const getResponseTimeInputSummary = (r: any): string => {
  const explicit =
    r?.input_summary ||
    r?.summary ||
    r?.label_summary ||
    r?.target_summary;
  if (typeof explicit === "string" && explicit.trim()) {
    return explicit.replace(/\s+/g, " ").trim();
  }

  let labelText = "";
  let placeholder = "";
  let titleAttr = "";
  let ariaLabel = "";
  let nameAttr = "";
  let idAttr = "";
  let classAttr = "";
  let textContent = "";

  if (typeof r?.element_html === "string" && r.element_html.trim()) {
    try {
      const doc = new DOMParser().parseFromString(r.element_html, "text/html");
      const labelEl = doc.body.querySelector("label");
      if (labelEl?.textContent) {
        labelText = labelEl.textContent.replace(/\s+/g, " ").trim();
      }
      const fieldEl =
        doc.body.querySelector("input, textarea, select, form, meta") ??
        doc.body.firstElementChild;
      if (fieldEl) {
        placeholder = (fieldEl.getAttribute("placeholder") || "").trim();
        titleAttr = (fieldEl.getAttribute("title") || "").trim();
        ariaLabel = (fieldEl.getAttribute("aria-label") || "").trim();
        nameAttr = (fieldEl.getAttribute("name") || "").toLowerCase();
        idAttr = (fieldEl.getAttribute("id") || "").toLowerCase();
        classAttr = (fieldEl.getAttribute("class") || "").toLowerCase();
      }
      textContent = (doc.body.textContent || "").replace(/\s+/g, " ").trim();
    } catch {
      // ignore parse failure
    }
  }

  const combinedSource = `${labelText} ${ariaLabel} ${titleAttr} ${placeholder} ${idAttr} ${nameAttr} ${classAttr} ${textContent} ${r?.message || ""}`;

  if (/(otp|auth[_-]?code|verify|verification|cert|인증\s*코드|인증\s*번호|확인\s*코드|보안\s*코드)/i.test(combinedSource)) {
    return "인증코드입력";
  }

  const humanHint = labelText || ariaLabel || titleAttr || placeholder;
  if (humanHint) {
    const cleaned = humanHint
      .replace(/을\(를\)|을|를|이|가/g, "")
      .replace(/(입력해\s*주세요|입력하세요|선택해\s*주세요|선택하세요)\.?$/g, "")
      .trim();
    const base = cleaned || humanHint;
    if (/(입력|선택|인증|확인)$/.test(base)) {
      return base;
    }
    return `${base} 입력`;
  }

  if (/(session|logout|세션|자동\s*로그아웃|로그인\s*연장)/i.test(combinedSource)) {
    return "세션 시간 연장";
  }
  if (/(http-equiv=["']?refresh|자동\s*새로고침|페이지\s*전환)/i.test(`${r?.element_html || ""} ${combinedSource}`)) {
    return "페이지 자동 전환";
  }
  if (/(password|passwd|pwd|비밀번호)/i.test(combinedSource)) {
    return "비밀번호 입력";
  }
  if (/(timer|countdown|남은\s*시간|제한\s*시간)/i.test(combinedSource)) {
    return "시간 제한 입력";
  }

  return "";
};

const ResponseTimeDetail = ({ results }: Props) => {
  const [filter, setFilter] = useState<"compliant" | "non-compliant">("non-compliant");
  const [expandedMap, setExpandedMap] = useState<Record<number | string, boolean>>({});

  const filteredResults = results.filter((result) => {
    const isCompliant = isResponseTimeCompliant(result);
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
            ℹ️ WEBridge는 [응답 시간 조절] 미준수 여부를 다음 기준으로 확인해요.
          </span>
        </div>
        <ul className="space-y-1 text-sm text-gray-800">
          <li>• 시간 제한 콘텐츠가 존재하는 경우</li>
        </ul>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold text-gray-900">
            ℹ️ 오류 항목을 수정하기 위해 아래 내용을 준수해야 해요.
          </span>
        </div>
        <ul className="space-y-1 text-sm text-gray-800">
          <li>• 시간 제한이 있는 콘텐츠는 제공하지 않아야 해요.</li>
          <li>
            • 반응 시간이 정해진 콘텐츠를 제공해야 하는 경우, 최소 20초 이상의
            시간을 부여하고 사전에 반응 시간 조절 방법을 안내해야 해요.
          </li>
          <li>
            • 시간 제한을 해제하거나 연장할 수 있는 선택지를 제공하여 사용자가
            반응 시간을 조절할 수 있도록 해야 해요.
          </li>
        </ul>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold text-gray-900">
            💡 WEBridge 검사 이외에 이런 점도 고려해야 해요.
          </span>
        </div>
        <ul className="space-y-1 text-sm text-gray-800">
          <li>
            • 반응 시간 조절이 원천적으로 불가능한 경우(예: 온라인 경매, 실시간
            게임)는 본 검사 항목이 적용되지 않아요.
          </li>
          <li>
            • 검사 항목에 해당하지 않더라도, 사용자에게 시간 제한이 있다는
            사실과 종료 시점을 반드시 알려주어야 해요.
          </li>
          <li>• 세션 시간이 20시간 이상인 콘텐츠는 예외로 간주돼요.</li>
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
              const inputSummary = getResponseTimeInputSummary(r);

              return (
                <div key={itemKey} className="flex items-start gap-3">
                  {/* 좌측 순번 박스 */}
                  <div className="flex items-center justify-center w-8 h-8 text-sm font-medium text-gray-900 bg-white border border-[#727272] rounded shrink-0">
                    {index + 1}
                  </div>

                  {/* 우측 결과 카드 */}
                  <div className="flex-1 p-5 space-y-3 bg-white border border-[#727272] rounded-lg">
                    {/* 2: 입력값 요약 정보 배지 */}
                    <div>
                      <span className="inline-flex items-center px-4 py-1.5 text-xs font-medium text-white rounded-md bg-[#6B7280]">
                        입력값 요약 :{inputSummary ? ` ${inputSummary}` : ""}
                      </span>
                    </div>

                    {/* 1: 응답 시간 조절 HTML 소스 코드 + 더보기 */}
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

export default ResponseTimeDetail;
