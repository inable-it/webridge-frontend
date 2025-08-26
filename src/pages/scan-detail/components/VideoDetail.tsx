import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";
import type { VideoResult } from "@/features/api/scanApi";

type Props = { results: VideoResult[]; scanUrl?: string };

const VideoDetail = ({ results }: Props) => {
  return (
    <div className="space-y-4">
      <div className="p-4 mb-6 border border-green-200 rounded-lg bg-green-50">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-bold text-green-700 text-md">
            [ 자막 제공 ] 수정 가이드
          </span>
        </div>
      </div>

      {results.map((result, index) => (
        <Card key={result.id} className="border-l-4 border-l-pink-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              오류 항목 {index + 1}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.video_url && (
              <div>
                <label className="text-xs font-medium text-gray-500">
                  비디오 URL
                </label>
                <div className="p-2 mt-1 text-sm break-all rounded bg-gray-50">
                  {result.video_url}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {result.has_thumbnail ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className="text-sm">썸네일</span>
                </div>
                <div className="flex items-center gap-2">
                  {result.has_transcript ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className="text-sm">자막/대본</span>
                </div>
                <div className="flex items-center gap-2">
                  {result.has_audio_description ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className="text-sm">오디오 설명</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {result.keyboard_accessible ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className="text-sm">키보드 접근</span>
                </div>
                <div className="flex items-center gap-2">
                  {result.has_aria_label ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className="text-sm">ARIA 레이블</span>
                </div>
                <div className="flex items-center gap-2">
                  {result.autoplay_disabled ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className="text-sm">자동재생 비활성화</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default VideoDetail;
