import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";
import type { VideoResult } from "@/features/api/scanApi";

type Props = { results: VideoResult[]; scanUrl?: string };

// 아이콘 + 라벨 공통 렌더러
const BoolItem = ({ ok, label }: { ok?: boolean; label: string }) => (
  <div className="flex items-center gap-2">
    {ok ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : (
      <XCircle className="w-4 h-4 text-red-600" />
    )}
    <span className="text-sm">{label}</span>
  </div>
);

const VideoDetail = ({ results }: Props) => {
  return (
    <div className="space-y-4">
      <div className="p-4 mb-6 border border-green-200 rounded-lg bg-green-50">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-bold text-green-700 text-md">
            [ 자막 제공 ] 수정 가이드
          </span>
        </div>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold">
            ℹ️ WEBridge는 [자막 제공] 미준수 여부를 다음 기준으로 확인해요.
          </span>
        </div>
        <ul className="space-y-1 text-sm">
          <li>• 동영상에 script가 포함되어 있지 않은 경우</li>
        </ul>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold">
            ℹ️ 오류 항목을 수정하기 위해 아래 내용을 준수해야 해요.
          </span>
        </div>
        <ul className="space-y-1 text-sm">
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
          <span className="text-sm font-bold">
            💡 WEBridge 검사 이외에 이런 점도 고려해야 해요.
          </span>
        </div>
        <ul className="space-y-1 text-sm">
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

      {results.map((result, index) => {
        // 스키마 차이를 안전하게 처리하기 위해 any 캐스팅
        const r = result as any;

        const isCompliant = !!r?.compliant;
        const createdAt = r?.created_at
          ? new Date(r.created_at).toLocaleString("ko-KR")
          : null;

        return (
          <Card key={r.id ?? index} className="border-l-4 border-l-pink-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  오류 항목 {index + 1}
                </CardTitle>
                <div
                  className={`text-xs px-2 py-1 rounded ${
                    isCompliant
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {isCompliant ? "준수" : "미준수"}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* 비디오 URL */}
              {r?.video_url && (
                <div>
                  <label className="text-xs font-medium text-gray-500">
                    비디오 URL
                  </label>
                  <div className="p-2 mt-1 text-sm break-all rounded bg-gray-50">
                    {r.video_url}
                  </div>
                </div>
              )}

              {/* 원본 엘리먼트 HTML 스니펫 */}
              {r?.element_html && (
                <div>
                  <label className="text-xs font-medium text-gray-500">
                    요소 HTML
                  </label>
                  <pre className="p-2 mt-1 overflow-auto text-xs rounded bg-gray-50">
                    {r.element_html}
                  </pre>
                </div>
              )}

              {/* 항목별 여부 표시 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <BoolItem ok={r?.has_thumbnail} label="썸네일" />
                  <BoolItem ok={r?.has_transcript} label="자막/대본" />
                </div>
                <div className="space-y-2">
                  <BoolItem ok={r?.has_audio_description} label="오디오 설명" />
                  <BoolItem ok={r?.has_aria_label} label="ARIA 레이블" />
                </div>
              </div>

              {/* 메시지 / 생성일시 */}
              {(r?.message || createdAt) && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {r?.message && (
                    <div>
                      <label className="text-xs font-medium text-gray-500">
                        메시지
                      </label>
                      <div className="p-2 mt-1 text-sm rounded bg-gray-50">
                        {r.message}
                      </div>
                    </div>
                  )}
                  {createdAt && (
                    <div>
                      <label className="text-xs font-medium text-gray-500">
                        검사 일시
                      </label>
                      <div className="p-2 mt-1 text-sm rounded bg-gray-50">
                        {createdAt}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default VideoDetail;
