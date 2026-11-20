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
  return ratio >= 7.0 ? "AAA" : "AA";
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
    <div className="space-y-6">
      {/* 수정 가이드 (피그마: 별도 카드 박스) */}
      <div className="p-6 bg-white border border-[#727272] rounded-lg shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          수정 가이드
        </h3>
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
                  {/* 좌측 순번 박스 */}
                  <div className="flex items-center justify-center w-8 h-8 text-sm font-medium text-gray-900 bg-white border border-[#727272] rounded shrink-0">
                    {index + 1}
                  </div>

                  {/* 우측 결과 카드 */}
                  <div className="flex-1 p-5 space-y-4 bg-white border border-[#727272] rounded-lg">
                    {/* 1 & 2: 텍스트 캡쳐 이미지 + HTML 소스 코드 */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
                      {/* 1: 텍스트 캡쳐 이미지 (글씨 부분 캡쳐) */}
                      <div className="relative flex items-center justify-center w-full sm:w-44 min-h-[104px] overflow-hidden rounded bg-[#D1D5DB] shrink-0">
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
                        ) : (
                          <span className="text-xs font-semibold text-gray-800">
                            글씨 부분 캡쳐
                          </span>
                        )}
                      </div>

                      {/* 2: 텍스트 콘텐츠 명도대비 HTML 소스 코드 + 더보기 */}
                      <div className="flex flex-col justify-between flex-1 p-3 bg-white border border-gray-300 rounded min-h-[104px]">
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

                    {/* 3, 4, (준수 시 5): 색상코드 / 명도대비 / 준수 등급 */}
                    {isCompliant ? (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {/* 3: 색상코드 */}
                        <div className="flex flex-col justify-between p-4 rounded bg-[#D9D9D9]/80 min-h-[120px]">
                          <span className="text-xs font-bold text-gray-900">
                            색상코드
                          </span>
                          <div className="grid grid-cols-2 gap-3 mt-2 text-center">
                            <div>
                              <div className="mb-1.5 text-xs text-gray-800">
                                배경색
                              </div>
                              <div
                                className="w-20 h-4 mx-auto border border-gray-300"
                                style={{ backgroundColor: r?.background_color || bgHex }}
                              />
                              <div className="mt-1.5 font-mono text-xs text-gray-900">
                                {bgHex}
                              </div>
                            </div>
                            <div>
                              <div className="mb-1.5 text-xs text-gray-800">
                                글자색
                              </div>
                              <div
                                className="w-20 h-4 mx-auto border border-gray-300"
                                style={{ backgroundColor: r?.foreground_color || fgHex }}
                              />
                              <div className="mt-1.5 font-mono text-xs text-gray-900">
                                {fgHex}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 4: 명도대비 */}
                        <div className="flex flex-col p-4 rounded bg-[#D9D9D9]/80 min-h-[120px]">
                          <span className="text-xs font-bold text-gray-900">
                            명도대비
                          </span>
                          <div className="flex items-center justify-center flex-1 text-xl font-bold text-gray-900">
                            {ratioText}
                          </div>
                        </div>

                        {/* 5: 준수 등급 (WCAG 기준) - 준수 시에만 제공 */}
                        <div className="flex flex-col p-4 rounded bg-[#D9D9D9]/80 min-h-[120px]">
                          <span className="text-xs font-bold text-gray-900">
                            준수 등급 (WCAG 기준)
                          </span>
                          <div className="flex items-center justify-center flex-1 text-xl font-bold text-gray-900">
                            {getWcagGrade(r)}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 max-w-xl mx-auto w-full">
                        {/* 3: 색상코드 */}
                        <div className="flex flex-col justify-between p-4 rounded bg-[#D9D9D9]/80 min-h-[120px]">
                          <span className="text-xs font-bold text-gray-900">
                            색상코드
                          </span>
                          <div className="grid grid-cols-2 gap-3 mt-2 text-center">
                            <div>
                              <div className="mb-1.5 text-xs text-gray-800">
                                배경색
                              </div>
                              <div
                                className="w-20 h-4 mx-auto border border-gray-300"
                                style={{ backgroundColor: r?.background_color || bgHex }}
                              />
                              <div className="mt-1.5 font-mono text-xs text-gray-900">
                                {bgHex}
                              </div>
                            </div>
                            <div>
                              <div className="mb-1.5 text-xs text-gray-800">
                                글자색
                              </div>
                              <div
                                className="w-20 h-4 mx-auto border border-gray-300"
                                style={{ backgroundColor: r?.foreground_color || fgHex }}
                              />
                              <div className="mt-1.5 font-mono text-xs text-gray-900">
                                {fgHex}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 4: 명도 대비 (미준수 시 빨간색 수치 표시) */}
                        <div className="flex flex-col p-4 rounded bg-[#D9D9D9]/80 min-h-[120px]">
                          <span className="text-xs font-bold text-gray-900">
                            명도 대비
                          </span>
                          <div className="flex items-center justify-center flex-1 text-xl font-bold text-red-600">
                            {ratioText}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 6: 안내문 (미준수 시 자가 판단용 2가지 경고문 고정 제공) */}
                    {!isCompliant && (
                      <div className="space-y-2">
                        <div className="p-3.5 bg-white border-2 border-red-500 rounded">
                          <p className="flex items-center gap-1.5 text-sm font-bold text-gray-900">
                            <span aria-hidden="true">⚠</span>
                            <span className="sr-only">확인 안내: </span>
                            대형 텍스트인지 확인해 보세요.
                          </p>
                          <ul className="mt-1 ml-5 text-xs font-semibold text-gray-900 list-disc">
                            <li>
                              폰트를 18pt 이상 또는 14pt 이상의 굵은 폰트를 사용하는
                              경우라면 명도 대비를{" "}
                              <span className="font-bold text-blue-600">3:1</span>{" "}
                              까지 낮출 수 있어요.
                            </li>
                          </ul>
                        </div>

                        <div className="p-3.5 bg-white border-2 border-red-500 rounded">
                          <p className="flex items-center gap-1.5 text-sm font-bold text-gray-900">
                            <span aria-hidden="true">⚠</span>
                            <span className="sr-only">확인 안내: </span>
                            확대텍스트인지 확인해 보세요.
                          </p>
                          <ul className="mt-1 ml-5 text-xs font-semibold text-gray-900 list-disc">
                            <li>
                              화면 확대가 가능하도록 구현한 텍스트 콘텐츠라면 명도
                              대비를{" "}
                              <span className="font-bold text-blue-600">3:1</span>{" "}
                              까지 낮출 수 있어요.
                            </li>
                          </ul>
                        </div>
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
