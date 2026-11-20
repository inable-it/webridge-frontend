import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { VideoAutoPlayResult } from "@/features/api/scanApi";

type Props = { results: VideoAutoPlayResult[]; scanUrl?: string };

export const isAutoPlayCompliant = (r: any): boolean => {
  if (typeof r?.compliant === "boolean") return r.compliant;
  return Boolean(r?.autoplay_disabled);
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

const extractYouTubeId = (url?: string | null): string | null => {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:embed\/|watch\?v=|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  return match ? match[1] : null;
};

/**
 * 자동 재생 콘텐츠에서 캡쳐/썸네일 이미지 또는 비디오 미리보기 URL 추출
 */
const resolveAutoPlayPreview = (
  r: any,
  scanUrl?: string
): { imageUrl: string | null; videoUrl: string | null } => {
  const explicitImage =
    r?.screenshot_url ||
    r?.capture_url ||
    r?.thumbnail_url ||
    r?.poster_url ||
    r?.poster ||
    r?.img_url;
  if (explicitImage) {
    return {
      imageUrl: toAbsoluteUrl(explicitImage, scanUrl),
      videoUrl: null,
    };
  }

  let parsedPoster: string | null = null;
  let parsedVideoSrc: string | null = null;
  let parsedIframeSrc: string | null = null;
  let parsedImgSrc: string | null = null;

  if (r?.element_html) {
    try {
      const doc = new DOMParser().parseFromString(r.element_html, "text/html");
      const videoEl = doc.body.querySelector("video");
      if (videoEl) {
        parsedPoster = videoEl.getAttribute("poster");
        parsedVideoSrc =
          videoEl.getAttribute("src") ||
          videoEl.querySelector("source")?.getAttribute("src") ||
          null;
      }
      const iframeEl = doc.body.querySelector("iframe");
      if (iframeEl) {
        parsedIframeSrc = iframeEl.getAttribute("src");
      }
      const imgEl = doc.body.querySelector("img");
      if (imgEl) {
        parsedImgSrc = imgEl.getAttribute("src");
      }
    } catch {
      // ignore parse failure
    }
  }

  if (parsedPoster || parsedImgSrc) {
    return {
      imageUrl: toAbsoluteUrl((parsedPoster || parsedImgSrc) ?? undefined, scanUrl),
      videoUrl: null,
    };
  }

  const ytId =
    extractYouTubeId(r?.video_url) ||
    extractYouTubeId(parsedIframeSrc) ||
    extractYouTubeId(parsedVideoSrc);
  if (ytId) {
    return {
      imageUrl: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
      videoUrl: null,
    };
  }

  const candidateVideo = toAbsoluteUrl(
    r?.video_url || parsedVideoSrc || undefined,
    scanUrl
  );
  return {
    imageUrl: null,
    videoUrl: candidateVideo,
  };
};

const AutoPlayDetail = ({ results, scanUrl }: Props) => {
  const [filter, setFilter] = useState<"compliant" | "non-compliant">("non-compliant");
  const [expandedMap, setExpandedMap] = useState<Record<number | string, boolean>>({});
  const [failedPreviewMap, setFailedPreviewMap] = useState<Record<number | string, boolean>>({});

  const filteredResults = results.filter((result) => {
    const isCompliant = isAutoPlayCompliant(result);
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
            ℹ️ WEBridge는 [자동 재생 금지] 미준수 여부를 다음 기준으로 확인해요.
          </span>
        </div>
        <ul className="space-y-1 text-sm text-gray-800">
          <li>• HTML 속성에 autoplay가 존재하는 경우</li>
          <li>• autoplay 속성이 없더라도 JavaScript로 강제 재생되는 경우</li>
        </ul>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold text-gray-900">
            ℹ️ 오류 항목을 수정하기 위해 아래 내용을 준수해야 해요.
          </span>
        </div>
        <ul className="space-y-1 text-sm text-gray-800">
          <li>
            • 웹 페이지 진입 시 자동 재생되는 3초 이상의 멀티미디어 파일은 정지
            상태로 제공되어야 해요.
          </li>
          <li>
            • 사용자가 요구할 경우에만 재생할 수 있도록 소리 제어 수단(멈춤,
            일시 정지, 음량 조절 등)을 제공해야 해요.
          </li>
        </ul>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold text-gray-900">
            💡 WEBridge 검사 이외에 이런 점도 고려해야 해요.
          </span>
        </div>
        <ul className="space-y-1 text-sm text-gray-800">
          <li>• 자동 재생 소리가 3초 이상인지 미만인지 확인해야 해요.</li>
          <li>
            • 자동 재생 기능을 제공해야 할 경우 3초 내에 정지, 지정된 키(ex. esc키)
            선택 시 정지, 소스 상 가장 먼저 제공하여 정지 기능 실행하도록 구현하면 돼요.
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
              const isCompliant = isAutoPlayCompliant(r);
              const isExpanded = !!expandedMap[itemKey];
              const previewFailed = !!failedPreviewMap[itemKey];
              const { imageUrl, videoUrl } = resolveAutoPlayPreview(r, scanUrl);
              const htmlCode = r?.element_html || "";

              return (
                <div key={itemKey} className="flex items-start gap-3">
                  {/* 좌측 순번 박스 */}
                  <div className="flex items-center justify-center w-8 h-8 text-sm font-medium text-gray-900 bg-white border border-[#727272] rounded shrink-0">
                    {index + 1}
                  </div>

                  {/* 우측 결과 카드 */}
                  <div className="flex-1 p-5 space-y-3 bg-white border border-[#727272] rounded-lg">
                    {/* 1 & 2: 자동 재생 콘텐츠 이미지 + HTML 소스 코드 */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
                      {/* 1: 자동 재생 콘텐츠 이미지 (움직이는 부분 캡쳐) */}
                      <div className="relative flex items-center justify-center w-full sm:w-56 min-h-[120px] overflow-hidden rounded bg-[#D1D5DB] shrink-0">
                        {!previewFailed && imageUrl ? (
                          <img
                            src={imageUrl}
                            alt="움직이는 부분 캡쳐"
                            className="object-cover w-full h-full"
                            onError={() =>
                              setFailedPreviewMap((prev) => ({
                                ...prev,
                                [itemKey]: true,
                              }))
                            }
                          />
                        ) : !previewFailed && videoUrl ? (
                          <video
                            src={videoUrl}
                            preload="metadata"
                            muted
                            playsInline
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
                            움직이는 부분 캡쳐
                          </span>
                        )}
                      </div>

                      {/* 2: 자동 재생 콘텐츠 HTML 소스 코드 + 더보기 */}
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

                    {/* 3: 안내문 (미준수일 때만 표시, 고정값) */}
                    {!isCompliant && (
                      <div className="p-3.5 bg-white border-2 border-red-500 rounded">
                        <p className="flex items-center gap-1.5 text-sm font-bold text-gray-900">
                          <span aria-hidden="true">⚠</span>
                          <span className="sr-only">미준수 사유: </span>
                          HTML 속성에 autoplay가 존재해요.
                        </p>
                        <ul className="mt-1.5 ml-5 space-y-0.5 text-xs font-semibold text-gray-900 list-disc">
                          <li>
                            autoplay 속성을 제거하여 자동 재생이 되지 않도록 해야 해요.
                          </li>
                          <li>
                            JS로 인해 강제 재생되지 않도록 해당 기능을 제거해 주세요.
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

export default AutoPlayDetail;
