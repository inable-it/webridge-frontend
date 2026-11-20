import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { LabelResult } from "@/features/api/scanApi";

type Props = { results: LabelResult[]; scanUrl?: string };

export const isLabelCompliant = (r: any): boolean => {
  if (typeof r?.label_present === "boolean") return r.label_present;
  return Boolean(r?.compliant);
};

/**
 * 입력 서식의 HTML 및 속성으로부터 어떤 정보를 입력하는 레이블인지 요약 문구 생성
 * 예: "아이디 입력창", "검색어 입력창", "목록 선택창" 등
 */
const getLabelSummary = (r: any): string => {
  const explicit = r?.label_summary || r?.summary || r?.label_text;
  if (typeof explicit === "string" && explicit.trim()) {
    return explicit.trim();
  }

  let tagName = "";
  let typeAttr = (r?.input_type || "").toLowerCase();
  let labelText = "";
  let placeholder = "";
  let titleAttr = "";
  let ariaLabel = "";
  let nameAttr = "";
  let idAttr = "";

  if (r?.element_html) {
    try {
      const doc = new DOMParser().parseFromString(r.element_html, "text/html");
      const labelEl = doc.body.querySelector("label");
      if (labelEl?.textContent) {
        labelText = labelEl.textContent.replace(/\s+/g, " ").trim();
      }
      const fieldEl =
        doc.body.querySelector("input, textarea, select") ??
        doc.body.firstElementChild;
      if (fieldEl) {
        tagName = fieldEl.tagName.toLowerCase();
        typeAttr = (fieldEl.getAttribute("type") || typeAttr || "").toLowerCase();
        placeholder = (fieldEl.getAttribute("placeholder") || "").trim();
        titleAttr = (fieldEl.getAttribute("title") || "").trim();
        ariaLabel = (fieldEl.getAttribute("aria-label") || "").trim();
        nameAttr = (fieldEl.getAttribute("name") || "").toLowerCase();
        idAttr = (fieldEl.getAttribute("id") || "").toLowerCase();
      }
    } catch {
      // ignore parse failure
    }
  }

  const suffix =
    tagName === "select" || typeAttr === "select"
      ? "선택창"
      : typeAttr === "checkbox"
      ? "체크박스"
      : typeAttr === "radio"
      ? "라디오 버튼"
      : "입력창";

  const humanHint = labelText || ariaLabel || titleAttr || placeholder;
  if (humanHint) {
    const cleaned = humanHint
      .replace(/을\(를\)|을|를|이|가/g, "")
      .replace(/(입력해\s*주세요|입력하세요|선택해\s*주세요|선택하세요|검색해\s*주세요|검색하세요)\.?$/g, "")
      .trim();
    const base = cleaned || humanHint;
    if (/(입력창|선택창|체크박스|라디오|입력란|필드)$/.test(base)) {
      return base;
    }
    return `${base} ${suffix}`;
  }

  const keySource = `${idAttr} ${nameAttr} ${typeAttr}`;
  if (/(search|query|keyword|sch|검색|찾기|\bq\b)/i.test(keySource)) {
    return "검색어 입력창";
  }
  if (/(password|passwd|pwd|\bpw\b|비밀번호)/i.test(keySource)) {
    return "비밀번호 입력창";
  }
  if (/(userid|user_id|loginid|login_id|memberid|아이디|\bid\b)/i.test(keySource)) {
    return "아이디 입력창";
  }
  if (/(email|e-mail|mail|이메일)/i.test(keySource)) {
    return "이메일 입력창";
  }
  if (/(phone|tel|mobile|cell|연락처|전화|휴대폰)/i.test(keySource)) {
    return "연락처 입력창";
  }
  if (/(username|user_name|name|이름|성명)/i.test(keySource)) {
    return "이름 입력창";
  }
  if (/(birth|생년월일)/i.test(keySource)) {
    return "생년월일 입력창";
  }
  if (/(addr|address|zip|postal|주소|우편번호)/i.test(keySource)) {
    return "주소 입력창";
  }
  if (typeAttr === "date") return "날짜 입력창";
  if (typeAttr === "file") return "파일 첨부 입력창";
  if (typeAttr === "number") return "숫자 입력창";
  if (typeAttr === "checkbox") return "체크박스 항목";
  if (typeAttr === "radio") return "라디오 선택 항목";
  if (tagName === "select" || typeAttr === "select") return "목록 선택창";
  if (tagName === "textarea" || typeAttr === "textarea") return "내용 입력창";
  if (typeAttr && typeAttr !== "text") return `${typeAttr} 입력창`;

  return "텍스트 입력창";
};

const LabelDetail = ({ results }: Props) => {
  const [filter, setFilter] = useState<"compliant" | "non-compliant">("non-compliant");
  const [expandedMap, setExpandedMap] = useState<Record<number | string, boolean>>({});

  const filteredResults = results.filter((result) => {
    const isCompliant = isLabelCompliant(result);
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
              ℹ️ WEBridge는 [레이블 제공] 미준수 여부를 다음 기준으로 확인해요.
            </span>
          </div>
          <ul className="space-y-1 text-sm text-gray-800">
            <li>• 입력 서식과 레이블이 1:1로 매칭되어 있지 않은 경우</li>
          </ul>
          <div className="flex items-center gap-2 mt-4 mb-2">
            <span className="text-sm font-bold text-gray-900">
              ℹ️ 오류 항목을 수정하기 위해 아래 내용을 준수해야 해요.
            </span>
          </div>
          <ul className="space-y-1 text-sm text-gray-800">
            <li>• 레이블과 사용자 입력 간의 관계를 대응시켜야 해요.</li>
            <li>
              • 레이블을 제공하고 label for 값과 input의 id 값을 동일하게 제공해야
              해요.
            </li>
          </ul>
          <div className="flex items-center gap-2 mt-4 mb-2">
            <span className="text-sm font-bold text-gray-900">
              💡 WEBridge 검사 이외에 이런 점도 고려해야 해요.
            </span>
          </div>
          <ul className="space-y-1 text-sm text-gray-800">
            <li>
              • 레이블과 입력 서식이 1:다 매칭인 경우 각 입력 서식에 대해 title을
              제공해야 해요.
            </li>
            <li>
              • 레이블이 시각적으로 노출되지 않은 경우 각 입력 서식에 대해 title을
              제공해야 해요.
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
              const labelSummary = getLabelSummary(r);

              return (
                <div key={itemKey} className="flex items-start gap-3">
                  {/* 좌측 순번 배지 */}
                  <div className="flex items-center justify-center w-6 h-6 text-xs font-semibold text-white rounded bg-[#6B7280] shrink-0">
                    {index + 1}
                  </div>

                  {/* 우측 결과 카드 */}
                  <div className="flex-1 p-5 space-y-3 bg-white border border-gray-300 rounded-lg">
                    {/* 2: 레이블 요약 정보 배지 */}
                    <div>
                      <span className="inline-flex items-center px-4 py-1.5 text-xs font-medium text-white rounded-md bg-[#6B7280]">
                        레이블 요약 : {labelSummary}
                      </span>
                    </div>

                    {/* 1: 레이블 제공 HTML 소스 코드 + 더보기 */}
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

export default LabelDetail;
