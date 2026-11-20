import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { ContrastResult } from "@/features/api/scanApi";

type Props = { results: ContrastResult[]; scanUrl?: string };

export const isContrastCompliant = (r: any): boolean => {
  if (typeof r?.contrast_ratio === "number" && !Number.isNaN(r.contrast_ratio)) {
    return r.contrast_ratio >= 4.5;
  }
  return Boolean(r?.wcag_compliant ?? r?.compliant);
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

/**
 * 색상 문자열(hex 또는 rgb/rgba)을 대문자 #RRGGBB 형식으로 변환
 */
const formatHexColor = (color?: string): string => {
  if (!color) return "#000000";
  const trimmed = color.trim();
  if (trimmed.startsWith("#")) {
    if (trimmed.length === 4) {
      const r = trimmed[1];
      const g = trimmed[2];
      const b = trimmed[3];
      return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
    }
    return trimmed.toUpperCase();
  }
  const rgbMatch = trimmed.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgbMatch) {
    const toHex = (n: string) =>
      Math.max(0, Math.min(255, Number(n)))
        .toString(16)
        .padStart(2, "0")
        .toUpperCase();
    return `#${toHex(rgbMatch[1])}${toHex(rgbMatch[2])}${toHex(rgbMatch[3])}`;
  }
  return trimmed.toUpperCase();
};

const formatContrastRatio = (ratio?: number): string => {
  if (typeof ratio !== "number" || Number.isNaN(ratio)) return "0";
  return String(Number(ratio.toFixed(2)));
};

const getWcagGrade = (r: any): string => {
  const explicit = r?.wcag_level || r?.wcag_grade || r?.grade;
  if (typeof explicit === "string" && explicit.trim()) {
    return explicit.trim().toUpperCase();
  }
  const ratio = typeof r?.contrast_ratio === "number" ? r.contrast_ratio : 0;
  if (ratio >= 7.0) return "AAA";
  if (ratio >= 4.5) return "AA";
  return "미달";
};

/**
 * HEX 색상 배경 위에서 가독성이 확보되는 텍스트/테두리 스타일 계산
 */
const getColorBadgeStyle = (hex: string) => {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) {
    return {
      backgroundColor: "#374151",
      color: "#FFFFFF",
      borderColor: "#374151",
    };
  }
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const isLight = luminance > 0.65;
  return {
    backgroundColor: hex,
    color: isLight ? "#1F2937" : "#FFFFFF",
    borderColor: isLight ? "#9CA3AF" : hex,
  };
};

const resolveContrastCaptureUrl = (r: any, scanUrl?: string): string | null => {
  const raw =
    r?.screenshot_url ||
    r?.capture_url ||
    r?.img_url ||
    r?.thumbnail_url ||
    r?.image_url;
  return toAbsoluteUrl(raw, scanUrl);
};

const ContrastDetail = ({ results, scanUrl }: Props) => {
  const [filter, setFilter] = useState<"compliant" | "non-compliant">("non-compliant");
  const [expandedMap, setExpandedMap] = useState<Record<number | string, boolean>>({});
  const [failedPreviewMap, setFailedPreviewMap] = useState<Record<number | string, boolean>>({});

  const filteredResults = results.filter((result) => {
    const isCompliant = isContrastCompliant(result);
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
              ℹ️ WEBridge는 [텍스트 콘텐츠의 명도대비] 미준수 여부를 다음 기준으로
              확인해요.
            </span>
          </div>
          <ul className="space-y-1 text-sm text-gray-800">
            <li>• 텍스트 콘텐츠와 배경 간의 명도 대비가 4.5 대 1 미만인 경우</li>
          </ul>
          <div className="flex items-center gap-2 mt-4 mb-2">
            <span className="text-sm font-bold text-gray-900">
              ℹ️ 오류 항목을 수정하기 위해 아래 내용을 준수해야 해요.
            </span>
          </div>
          <ul className="space-y-1 text-sm text-gray-800">
            <li>
              • 텍스트 콘텐츠(텍스트 및 텍스트 이미지)와 배경 간의 명도 대비가 4.5
              대 1 이상이 되도록 색상을 사용해야 해요.
            </li>
          </ul>
          <div className="flex items-center gap-2 mt-4 mb-2">
            <span className="text-sm font-bold text-gray-900">
              💡 WEBridge 검사 이외에 이런 점도 고려해야 해요.
            </span>
          </div>
          <ul className="space-y-1 text-sm text-gray-800">
            <li>
              • 굵은 텍스트 폰트(18pt 이상 또는 14pt 이상)를 이용한다면 명도
              대비를 3 대 1까지 낮출 수 있어요.
            </li>
            <li>
              • 화면 확대가 가능한 텍스트 콘텐츠라면 명도 대비를 3 대 1까지 낮출
              수 있어요.
            </li>
            <li>
              • 로고, 장식 목적의 콘텐츠, 마우스나 키보드를 활용하여 초점을 받았을
              때 명도 대비가 커지는 콘텐츠 등은 예외로 해요.
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
              const isCompliant = isContrastCompliant(r);
              const isExpanded = !!expandedMap[itemKey];
              const previewFailed = !!failedPreviewMap[itemKey];
              const captureUrl = resolveContrastCaptureUrl(r, scanUrl);
              const htmlCode = r?.element_html || "";
              const bgHex = formatHexColor(r?.background_color);
              const fgHex = formatHexColor(r?.foreground_color);
              const ratioText = `${formatContrastRatio(r?.contrast_ratio)} : 1`;

              return (
                <div key={itemKey} className="flex items-start gap-3">
                  {/* 좌측 순번 배지 */}
                  <div className="flex items-center justify-center w-6 h-6 text-xs font-semibold text-white rounded bg-[#6B7280] shrink-0">
                    {index + 1}
                  </div>

                  {/* 우측 결과 카드 */}
                  <div className="flex-1 p-4 space-y-3 bg-white border border-gray-300 rounded-lg">
                    {/* 1 & 2: 연파랑 배경 박스 (글씨 부분 캡쳐 + HTML 소스 코드 + 더보기) */}
                    <div className="flex flex-col items-start justify-between gap-4 p-4 border border-blue-200 rounded sm:flex-row bg-[#EAF1FF]">
                      {/* 1: 텍스트 캡쳐 이미지 (흰색 라운드 박스) */}
                      <div className="relative flex items-center justify-center w-full overflow-hidden bg-white rounded-lg sm:w-56 h-36 shrink-0">
                        {!previewFailed && captureUrl ? (
                          <img
                            src={captureUrl}
                            alt="글씨 부분 캡쳐"
                            className="object-cover w-full h-full"
                            onError={() =>
                              setFailedPreviewMap((prev) => ({
                                ...prev,
                                [itemKey]: true,
                              }))
                            }
                          />
                        ) : null}
                      </div>

                      {/* 2: 텍스트 콘텐츠 명도대비 HTML 소스 코드 */}
                      <div
                        className={`flex-1 font-mono text-sm text-gray-800 break-all whitespace-pre-wrap ${
                          isExpanded ? "" : "line-clamp-3"
                        }`}
                      >
                        {htmlCode || "html 코드"}
                      </div>

                      {/* 더보기 버튼 */}
                      <button
                        type="button"
                        onClick={() => toggleExpand(itemKey)}
                        className="text-xs font-medium text-gray-700 underline-offset-2 hover:text-gray-900 hover:underline shrink-0"
                      >
                        {isExpanded ? "접기" : "더보기"}
                      </button>
                    </div>

                    {/* 3, 4, 5: 색상 코드 / 명도 대비 / 준수 등급 (WCAG 기준) */}
                    <div className="flex flex-wrap items-center gap-3">
                      {/* 3: 색상 코드 */}
                      <div className="flex flex-wrap items-center gap-3 px-4 py-2.5 rounded bg-[#F3F5F8]">
                        <span className="text-xs font-bold text-gray-900">
                          색상 코드
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            className="px-3 py-1.5 font-mono text-xs font-medium border rounded-md"
                            style={getColorBadgeStyle(bgHex)}
                          >
                            배경색 {bgHex}
                          </span>
                          <span
                            className="px-3 py-1.5 font-mono text-xs font-medium border rounded-md"
                            style={getColorBadgeStyle(fgHex)}
                          >
                            글자색 {fgHex}
                          </span>
                        </div>
                      </div>

                      {/* 4: 명도 대비 */}
                      <div className="flex items-center gap-3 px-4 py-2.5 rounded bg-[#F3F5F8]">
                        <span className="text-xs font-bold text-gray-900">
                          명도 대비
                        </span>
                        <span
                          className={`px-3 py-1.5 text-xs font-semibold bg-white border border-gray-400 rounded-md ${
                            isCompliant ? "text-gray-900" : "text-red-600"
                          }`}
                        >
                          {ratioText}
                        </span>
                      </div>

                      {/* 5: 준수 등급 ( WCAG 기준 ) */}
                      <div className="flex items-center gap-3 px-4 py-2.5 rounded bg-[#F3F5F8]">
                        <span className="text-xs font-bold text-gray-900">
                          준수 등급 ( WCAG 기준 )
                        </span>
                        <span className="px-3 py-1.5 text-xs font-semibold text-gray-900 bg-white border border-gray-400 rounded-md">
                          {getWcagGrade(r)}
                        </span>
                      </div>
                    </div>

                    {/* 6: 안내문 (미준수 시 대형 텍스트 안내문, 테두리 없이 카드 하단 배치) */}
                    {!isCompliant && (
                      <div className="px-1 pt-1 space-y-1 text-sm text-gray-900">
                        <p className="flex items-center gap-1.5 font-bold">
                          <span aria-hidden="true">⚠</span>
                          <span className="sr-only">확인 안내: </span>
                          <span>대형 텍스트인지 확인해 보세요.</span>
                        </p>
                        <ul className="ml-2 text-sm text-gray-800">
                          <li>
                            • 폰트를 18pt 이상 또는 14pt 이상의 굵은 폰트를
                            사용하는 경우라면 명도 대비를{" "}
                            <span className="font-bold text-[#2563EB]">3:1</span>{" "}
                            까지 낮출 수 있어요.
                          </li>
                        </ul>
                      </div>
                    )}
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

export default ContrastDetail;
