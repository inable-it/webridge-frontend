import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";
import type { VideoResult } from "@/features/api/scanApi";

type Props = { results: VideoResult[]; scanUrl?: string };

const AutoPlayDetail = ({ results }: Props) => {
  return (
    <div className="space-y-4">
      <div className="p-4 mb-6 border border-blue-200 rounded-lg bg-blue-50">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-bold text-blue-700 text-md">
            [ 자동 재생 금지 ] 수정 가이드
          </span>
        </div>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold">
            ℹ️ WEBridge는 [자동 재생 금지] 미준수 여부를 다음 기준으로 확인해요.
          </span>
        </div>
        <ul className="space-y-1 text-sm">
          <li>• 자동 재생 플레이어가 있는 경우</li>
        </ul>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold">
            ℹ️ 오류 항목을 수정하기 위해 아래 내용을 준수해야 해요.
          </span>
        </div>
        <ul className="space-y-1 text-sm">
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
          <span className="text-sm font-bold">
            💡 WEBridge 검사 이외에 이런 점도 고려해야 해요.
          </span>
        </div>
        <ul className="space-y-1 text-sm">
          <li>• 자동 재생 소리가 3초 이상인지 미만인지 확인해야 해요.</li>
          <li>
            • 자동 재생 기능을 제공해야 할 경우 3초 내에 정지, 지정된 키(ex.
            esc키) 선택 시 정지, 소스 상 가장 먼저 제공하여 정지 기능 실행하도록
            구현하면 돼요.
          </li>
        </ul>
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

export default AutoPlayDetail;
