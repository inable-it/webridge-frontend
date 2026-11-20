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
    <div className="space-y-8">
      {/* 수정 가이드 섹션 */}
      <div>
        <h3 className="mb-3 text-xl font-bold text-gray-900">
          수정 가이드
        </h3>
        <div className="p-6 bg-[#F3F5F8] border border-gray-200 rounded-lg">
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
              const isCompliant = isVideoCaptionCompliant(r);
              const isExpanded = !!expandedMap[itemKey];
              const previewFailed = !!failedPreviewMap[itemKey];
              const { imageUrl, videoUrl } = resolveVideoPreview(r, scanUrl);
              const htmlCode = r?.element_html || "";

              return (
                <div key={itemKey} className="flex items-start gap-3">
                  {/* 좌측 순번 배지 */}
                  <div className="flex items-center justify-center w-6 h-6 text-xs font-semibold text-white rounded bg-[#6B7280] shrink-0">
                    {index + 1}
                  </div>

                  {/* 우측 결과 카드 */}
                  <div className="flex-1 p-4 space-y-3 bg-white border border-gray-300 rounded-lg">
                    {/* 1 & 2: 연파랑 배경 박스 (영상 썸네일 이미지 + 비디오 HTML 소스 코드 + 더보기) */}
                    <div className="flex flex-col items-start justify-between gap-4 p-4 border border-blue-200 rounded sm:flex-row bg-[#EAF1FF]">
                      {/* 1: 썸네일 이미지 (흰색 라운드 박스) */}
                      <div className="relative flex items-center justify-center w-full overflow-hidden bg-white rounded-lg sm:w-56 h-36 shrink-0">
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
                        ) : null}
                      </div>

                      {/* 2: 비디오 HTML 소스 코드 */}
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

                    {/* 3: 제공되고 있는 대체 수단 */}
                    <div className="flex flex-wrap items-center gap-6 px-4 py-3 rounded bg-[#F3F5F8]">
                      <span className="text-xs font-bold text-gray-900">
                        제공되고 있는 대체 수단
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-md border ${
                            isCompliant
                              ? "bg-[#374151] text-white border-[#374151]"
                              : "bg-white text-gray-800 border-gray-400"
                          }`}
                        >
                          자막
                        </span>
                        <span className="px-3 py-1 text-xs font-medium text-gray-800 bg-white border border-gray-400 rounded-md">
                          대본
                        </span>
                        <span className="px-3 py-1 text-xs font-medium text-gray-800 bg-white border border-gray-400 rounded-md">
                          수어
                        </span>
                      </div>
                    </div>

                    {/* 4: 안내문 (준수 / 미준수 각각 고정값, 테두리 없이 카드 하단 배치) */}
                    {isCompliant ? (
                      <div className="px-1 pt-1 space-y-1 text-xs text-gray-800">
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
                      <div className="px-1 pt-1 space-y-3 text-xs text-gray-900">
                        <p className="flex items-center gap-1.5 font-bold">
                          <span aria-hidden="true">⚠</span>
                          <span className="sr-only">미준수 사유: </span>
                          <span>
                            비디오에 &lt;track&gt; 태그를 통해 자막을 제공해야 해요.
                          </span>
                        </p>

                        <div className="space-y-1">
                          <p className="flex items-center gap-1.5 font-bold">
                            <span aria-hidden="true">⚠</span>
                            <span>
                              준수했음에도 WEBridge에서 미준수로 판정됐다면, 아래 경우에 해당할 수 있어요.
                            </span>
                          </p>
                          <div className="space-y-0.5 text-gray-800">
                            <p>
                              대체 수단으로 자막이 아닌 대본 또는 수어를 제공하는 경우
                            </p>
                            <p>
                              &lt;track&gt; 태그가 아닌 다른 방식으로 자막을 제공하는 경우
                            </p>
                          </div>
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
