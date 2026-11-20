import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { FlashingResult } from "@/features/api/scanApi";

type Props = { results: FlashingResult[]; scanUrl?: string };

export const isFlashingCompliant = (r: any): boolean => {
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

const resolveFlashingCaptureUrl = (r: any, scanUrl?: string): string | null => {
  const raw =
    r?.screenshot_url ||
    r?.capture_url ||
    r?.thumbnail_url ||
    r?.img_url ||
    r?.image_url;
  return toAbsoluteUrl(raw, scanUrl);
};

const FlashingDetail = ({ results, scanUrl }: Props) => {
  const [filter, setFilter] = useState<"compliant" | "non-compliant">("non-compliant");
  const [expandedMap, setExpandedMap] = useState<Record<number | string, boolean>>({});
  const [failedPreviewMap, setFailedPreviewMap] = useState<Record<number | string, boolean>>({});

  const filteredResults = results.filter((result) => {
    const isCompliant = isFlashingCompliant(result);
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
              ℹ️ WEBridge는 [깜빡임과 번쩍임 사용 제한] 미준수 여부를 다음
              기준으로 확인해요.
            </span>
          </div>
          <ul className="space-y-1 text-sm text-gray-800">
            <li>• 초당 3~50회의 속도로 번쩍이는 콘텐츠가 있는 경우</li>
          </ul>
          <div className="flex items-center gap-2 mt-4 mb-2">
            <span className="text-sm font-bold text-gray-900">
              ℹ️ 오류 항목을 수정하기 위해 아래 내용을 준수해야 해요.
            </span>
          </div>
          <ul className="space-y-1 text-sm text-gray-800">
            <li>
              • 초당 3~50회로 깜빡이는 콘텐츠는 깜빡임을 정지할 수 있는 기능을
              제공해야 해요.
            </li>
            <li>
              • 번쩍임이 초당 3~50회일 경우, 10인치 이상 화면에서 해당 콘텐츠가
              차지하는 면적 합은 화면 전체의 10%를 넘지 않아야 해요.
            </li>
            <li>• 콘텐츠의 번쩍임 지속 시간은 3초 미만으로 제한해야 해요.</li>
          </ul>
          <div className="flex items-center gap-2 mt-4 mb-2">
            <span className="text-sm font-bold text-gray-900">
              💡 WEBridge 검사 이외에 이런 점도 고려해야 해요.
            </span>
          </div>
          <ul className="space-y-1 text-sm text-gray-800">
            <li>
              • 10인치 이상 화면을 사용하는 기기(예: 태블릿, PC 모니터, 무인
              안내기 등)에서는 광과민성 발작 유발 가능성에 특히 주의해야 해요.
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
              const captureUrl = resolveFlashingCaptureUrl(r, scanUrl);
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
                      {/* 번쩍이는 콘텐츠 캡쳐본 */}
                      <div className="relative flex items-center justify-center w-full sm:w-56 min-h-[120px] px-3 text-center overflow-hidden rounded bg-[#D1D5DB] shrink-0">
                        {!previewFailed && captureUrl ? (
                          <img
                            src={captureUrl}
                            alt="번쩍이는 콘텐츠 캡쳐본"
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
                            번쩍이는 콘텐츠 캡쳐본
                          </span>
                        )}
                      </div>

                      {/* 번쩍이는 콘텐츠 HTML 소스 코드 + 더보기 */}
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

export default FlashingDetail;
