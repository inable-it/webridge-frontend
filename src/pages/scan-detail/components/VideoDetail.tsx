import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { VideoResult } from "@/features/api/scanApi";

type Props = { results: VideoResult[]; scanUrl?: string };

export const isVideoCaptionCompliant = (r: any): boolean => {
  if (typeof r?.compliant === "boolean") return r.compliant;
  return Boolean(r?.has_transcript);
};

const toAbsoluteUrl = (rawUrl?: string, baseUrl?: string): string | null => {
  if (!rawUrl) return null;
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;
  try {
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("data:")) {
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
 * 비디오 결과에서 썸네일 이미지 URL 또는 비디오 미리보기 URL 추출
 */
const resolveVideoPreview = (
  r: any,
  scanUrl?: string
): { imageUrl: string | null; videoUrl: string | null } => {
  const explicitThumb =
    r?.thumbnail_url || r?.poster_url || r?.poster || r?.img_url;
  if (explicitThumb) {
    return {
      imageUrl: toAbsoluteUrl(explicitThumb, scanUrl),
      videoUrl: null,
    };
  }

  let parsedPoster: string | null = null;
  let parsedVideoSrc: string | null = null;
  let parsedIframeSrc: string | null = null;

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
    } catch {
      // ignore parse failure
    }
  }

  if (parsedPoster) {
    return {
      imageUrl: toAbsoluteUrl(parsedPoster, scanUrl),
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

  const candidateVideo = toAbsoluteUrl(r?.video_url || parsedVideoSrc || undefined, scanUrl);
  return {
    imageUrl: null,
    videoUrl: candidateVideo,
  };
};

const VideoDetail = ({ results, scanUrl }: Props) => {
  const [filter, setFilter] = useState<"compliant" | "non-compliant">("non-compliant");
  const [expandedMap, setExpandedMap] = useState<Record<number | string, boolean>>({});
  const [failedPreviewMap, setFailedPreviewMap] = useState<Record<number | string, boolean>>({});

  const filteredResults = results.filter((result) => {
    const isCompliant = isVideoCaptionCompliant(result);
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
            ℹ️ WEBridge는 [자막 제공] 미준수 여부를 다음 기준으로 확인해요.
          </span>
        </div>
        <ul className="space-y-1 text-sm text-gray-800">
          <li>• 동영상에 &lt;track&gt; 태그를 통해 자막을 제공하지 않는 경우</li>
        </ul>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold text-gray-900">
            ℹ️ 오류 항목을 수정하기 위해 아래 내용을 준수해야 해요.
          </span>
        </div>
        <ul className="space-y-1 text-sm text-gray-800">
          <li>
            • 멀티미디어 콘텐츠를 제공할 때는 자막, 대본, 수어 중 한 가지 이상의
            대체 수단을 제공해야 해요.
          </li>
          <li>
            • 대사 없이 영상만 제공하는 경우, 화면해설(텍스트, 오디오, 대본)을
            제공해야 해요.
          </li>
          <li>• 음성만 제공하는 경우, 대본 또는 수어를 제공해야 해요.</li>
        </ul>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold text-gray-900">
            💡 WEBridge 검사 이외에 이런 점도 고려해야 해요.
          </span>
        </div>
        <ul className="space-y-1 text-sm text-gray-800">
          <li>
            • 대체 수단(자막, 대본, 수어)을 제공할 때는, 멀티미디어 콘텐츠와
            동등한 내용을 제공해야 해요.
          </li>
          <li>
            • 가장 바람직한 방법은 폐쇄자막을 오디오와 동기화하여 제공하는
            것이에요.
          </li>
          <li>
            • 대체수단을 여러 언어로 제공하면, 사용자는 자신이 사용하길 원하는
            언어를 선택할 수 있어야 해요.
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
              const isCompliant = isVideoCaptionCompliant(r);
              const isExpanded = !!expandedMap[itemKey];
              const previewFailed = !!failedPreviewMap[itemKey];
              const { imageUrl, videoUrl } = resolveVideoPreview(r, scanUrl);
              const htmlCode = r?.element_html || "";

              return (
                <div key={itemKey} className="flex items-start gap-3">
                  {/* 좌측 순번 박스 */}
                  <div className="flex items-center justify-center w-8 h-8 text-sm font-medium text-gray-900 bg-white border border-[#727272] rounded shrink-0">
                    {index + 1}
                  </div>

                  {/* 우측 결과 카드 */}
                  <div className="flex-1 p-5 space-y-3 bg-white border border-[#727272] rounded-lg">
                    {/* 1 & 2: 영상 썸네일 이미지 + 비디오 HTML 소스 코드 */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
                      {/* 1: 썸네일 이미지 */}
                      <div className="relative flex items-center justify-center w-full sm:w-56 min-h-[120px] overflow-hidden rounded bg-[#D1D5DB] shrink-0">
                        {!previewFailed && imageUrl ? (
                          <img
                            src={imageUrl}
                            alt="영상 썸네일 이미지"
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
                            영상 썸네일 이미지
                          </span>
                        )}
                      </div>

                      {/* 2: 비디오 HTML 소스 코드 + 더보기 */}
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

                    {/* 3: 제공 수단 */}
                    <div className="flex flex-wrap items-center gap-6 px-4 py-3 rounded bg-[#D9D9D9]/80">
                      <span className="text-xs font-bold text-gray-900 min-w-[180px]">
                        {isCompliant
                          ? "제공되고 있는 대체 수단"
                          : "다음과 같은 대체 수단을 제공해야 해요"}
                      </span>
                      <div className="flex items-center gap-4">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-md ${
                            isCompliant
                              ? "bg-blue-600 text-white"
                              : "bg-white text-gray-900"
                          }`}
                        >
                          자막
                        </span>
                        <span className="px-3 py-1 text-xs font-semibold text-gray-900 bg-white rounded-md">
                          대본
                        </span>
                        <span className="px-3 py-1 text-xs font-semibold text-gray-900 bg-white rounded-md">
                          수어
                        </span>
                      </div>
                    </div>

                    {/* 4: 안내문 (준수 / 미준수 각각 고정값) */}
                    {isCompliant ? (
                      <div className="p-3.5 space-y-1 text-sm text-gray-900 bg-white border-2 border-red-400 rounded">
                        <p className="flex items-center gap-1.5">
                          <span aria-hidden="true">📌</span>
                          <span>
                            자막의 내용이 멀티미디어 콘텐츠와 동등한 내용인지 확인해볼 필요가 있어요.
                          </span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <span aria-hidden="true">📌</span>
                          <span>
                            자막이 여러 언어로 제공되고, 선택이 가능한지 확인해볼 필요가 있어요.
                          </span>
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="p-3.5 bg-white border-2 border-red-500 rounded">
                          <p className="flex items-center gap-1.5 text-sm font-bold text-gray-900">
                            <span aria-hidden="true">⚠</span>
                            <span className="sr-only">미준수 사유: </span>
                            비디오에 &lt;track&gt; 태그를 통해 자막을 제공해야 해요.
                          </p>
                        </div>

                        <div className="p-3.5 bg-white border-2 border-red-500 rounded">
                          <p className="flex items-center gap-1.5 text-sm font-bold text-gray-900">
                            <span aria-hidden="true">⚠</span>
                            <span>
                              준수했음에도 WEBridge에서 미준수로 판정됐다면, 아래 경우에 해당할 수 있어요.
                            </span>
                          </p>
                          <ul className="mt-1.5 ml-5 space-y-0.5 text-xs font-semibold text-gray-900 list-disc">
                            <li>
                              대체 수단으로 자막이 아닌 대본 또는 수어를 제공하는 경우
                            </li>
                            <li>
                              &lt;track&gt; 태그가 아닌 다른 방식으로 자막을 제공하는 경우
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

export default VideoDetail;
