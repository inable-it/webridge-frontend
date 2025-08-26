import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Copy, XCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { AltTextResult, ComplianceStatus } from "@/features/api/scanApi";

type Props = {
  results: AltTextResult[];
  scanUrl?: string;
};

const AltTextDetail = ({ results, scanUrl = "" }: Props) => {
  const getComplianceColor = (compliance: ComplianceStatus) => {
    switch (compliance) {
      case 0:
        return "text-green-600 bg-green-50";
      case 1:
      case 2:
      case 3:
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getComplianceIcon = (compliance: ComplianceStatus) => {
    switch (compliance) {
      case 0:
        return <CheckCircle className="w-4 h-4" />;
      case 1:
      case 2:
      case 3:
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getAbsoluteImageUrl = (imgUrl: string, baseUrl: string) => {
    try {
      if (imgUrl.startsWith("http://") || imgUrl.startsWith("https://"))
        return imgUrl;
      const base = new URL(baseUrl);
      const absoluteUrl = new URL(imgUrl, base.origin);
      return absoluteUrl.href;
    } catch {
      return imgUrl;
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 mb-6 border border-blue-200 rounded-lg bg-blue-50">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-bold text-blue-700 text-md">
            [ 적절한 대체텍스트 제공 ] 수정 가이드
          </span>
        </div>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold">
            ℹ️ WEBridge는 [적절한 대체 텍스트 제공] 미준수 여부를 다음 기준으로
            확인해요.
          </span>
        </div>
        <ul className="space-y-1 text-sm">
          <li>• 이미지에 alt 속성이 아예 없는 경우</li>
          <li>
            • 이미지에 입력된 대체 텍스트가 이미지의 의미와 맞지 않는 경우
          </li>
        </ul>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold">
            ℹ️ 오류 항목을 수정하기 위해 아래 내용을 준수해야 해요.
          </span>
        </div>
        <ul className="space-y-1 text-sm">
          <li>
            • 모든 의미있는 이미지에는 alt 속성을 통해 대체텍스트를 입력해야
            해요.
          </li>
          <li>
            • 대체텍스트는 이미지의 의미나 용도를 동등하게 인식할 수 있도록
            작성해야 해요.
          </li>
          <li>• 대체텍스트는 간단명료하게 제공하는 것이 좋아요.</li>
        </ul>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold">
            💡 WEBridge 검사 이외에 이런 점도 고려해야 해요.
          </span>
        </div>
        <ul className="space-y-1 text-sm">
          <li>
            • 이미지 외에도 동영상 등의 텍스트가 아닌 콘텐츠에도 대체 텍스트가
            필요해요.
          </li>
          <li>
            • 수어 영상처럼 이미 내용을 전달하고 있는 콘텐츠에는 대체 텍스트를
            따로 넣지 않아도 괜찮아요.
          </li>
          <li>
            • 장식용 이미지는 alt를 빈값으로 설정하면, 보조기술이 불필요한
            정보를 건너뛸 수 있어요.
          </li>
        </ul>
      </div>

      {results.map((result, index) => (
        <Card key={result.id} className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                오류 항목 {index + 1}
              </CardTitle>
              <Badge
                className={`${getComplianceColor(
                  result.compliance
                )} flex items-center gap-1`}
              >
                {getComplianceIcon(result.compliance)}
                {result.compliance_display}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <label className="block mb-1 text-xs font-medium text-gray-500">
                  이미지 미리보기
                </label>
                <div className="relative flex items-center justify-center w-32 h-24 overflow-hidden border rounded bg-gray-50">
                  <img
                    src={getAbsoluteImageUrl(result.img_url, scanUrl)}
                    alt="검사 대상 이미지"
                    className="object-contain max-w-full max-h-full"
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      const target = e.currentTarget;
                      target.style.display = "none";
                      const next =
                        target.nextElementSibling as HTMLElement | null;
                      if (next) next.style.display = "flex";
                    }}
                  />
                  <div className="absolute inset-0 items-center justify-center hidden p-2 text-xs text-center text-gray-400">
                    <div>
                      <div className="mb-1">🖼️</div>
                      <div>이미지를 불러올 수 없습니다</div>
                    </div>
                  </div>
                </div>
                <div className="mt-1 text-xs text-center text-gray-400">
                  {result.img_url.startsWith("http")
                    ? "외부 이미지"
                    : "사이트 내 이미지"}
                </div>
              </div>

              <div className="flex-1 space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500">
                    이미지 URL
                  </label>
                  <div className="p-2 mt-1 font-mono text-sm break-all rounded bg-gray-50">
                    &lt;img alt="" src="
                    {result.img_url.length > 100
                      ? result.img_url.substring(0, 100) + "..."
                      : result.img_url}
                    " style="width: 776px; height: 448px; border: none; filter:
                    none;"&gt;
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500">
                    현재 대체 텍스트
                  </label>
                  <div className="p-2 mt-1 text-sm rounded bg-gray-50">
                    {result.alt_text || "(없음)"}
                  </div>
                </div>
              </div>
            </div>

            {result.suggested_alt && (
              <div className="p-3 border border-blue-200 rounded bg-blue-50">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-blue-700">
                    ⭐ WEBridge AI 대체텍스트 제안
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 px-2 text-xs"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `alt="${result.suggested_alt}"`
                      );
                      toast({
                        title: "복사 완료",
                        description: "대체 텍스트가 클립보드에 복사되었습니다.",
                      });
                    }}
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    복사
                  </Button>
                </div>
                <div className="p-2 font-mono text-sm text-blue-800 bg-white border rounded">
                  alt="{result.suggested_alt}"
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AltTextDetail;
