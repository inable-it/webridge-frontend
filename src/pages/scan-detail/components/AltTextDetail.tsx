import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertCircle,
  CheckCircle,
  Copy,
  XCircle,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import type { AltTextResult, ComplianceStatus } from "@/features/api/scanApi";
import {
  useCreateAltTextFeedbackMutation,
  useDeleteAltTextFeedbackMutation,
} from "@/features/api/altTextFeedbackApi";

type Props = {
  results: AltTextResult[];
  scanUrl?: string;
};

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

// 각 result.id 별로 like/dislike 각각의 feedback id를 별도로 저장
type FeedbackState = Record<number, { likeId?: number; dislikeId?: number }>;

const AltTextDetail = ({ results, scanUrl }: Props) => {
  const [copiedOpenId, setCopiedOpenId] = useState<number | null>(null);

  // 현재 어떤 버튼이 전송 중인지 구분 (예: "123:like" / "123:dislike")
  const [sendingKey, setSendingKey] = useState<string | null>(null);

  // 독립 토글을 위한 로컬 상태
  const [feedbackState, setFeedbackState] = useState<FeedbackState>({});

  const [createAltTextFeedback] = useCreateAltTextFeedbackMutation();
  const [deleteAltTextFeedback] = useDeleteAltTextFeedbackMutation();

  const toggleLike = async (altTextResultId: number) => {
    const key = `${altTextResultId}:like`;
    const current = feedbackState[altTextResultId];
    const isActive = !!current?.likeId;

    try {
      setSendingKey(key);
      if (isActive) {
        // 활성화 → 비활성화 (DELETE)
        await deleteAltTextFeedback(current!.likeId!).unwrap();
        setFeedbackState((prev) => {
          const next = { ...(prev[altTextResultId] || {}) };
          delete next.likeId;
          return { ...prev, [altTextResultId]: next };
        });
      } else {
        // 비활성화 → 활성화 (POST)
        const created = await createAltTextFeedback({
          alt_text_result: altTextResultId,
          rating: "like",
        }).unwrap();
        setFeedbackState((prev) => ({
          ...prev,
          [altTextResultId]: {
            ...(prev[altTextResultId] || {}),
            likeId: created.id,
          },
        }));
        toast({
          title: "피드백이 반영되었습니다",
          description: "‘도움이 되었어요’로 기록했어요.",
        });
      }
    } catch (e: any) {
      toast({
        title: "피드백 처리 실패",
        description: e?.message || "잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setSendingKey(null);
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
  const toggleDislike = async (altTextResultId: number) => {
    const key = `${altTextResultId}:dislike`;
    const current = feedbackState[altTextResultId];
    const isActive = !!current?.dislikeId;

    try {
      setSendingKey(key);
      if (isActive) {
        // 활성화 → 비활성화 (DELETE)
        await deleteAltTextFeedback(current!.dislikeId!).unwrap();
        setFeedbackState((prev) => {
          const next = { ...(prev[altTextResultId] || {}) };
          delete next.dislikeId;
          return { ...prev, [altTextResultId]: next };
        });
      } else {
        // 비활성화 → 활성화 (POST)
        const created = await createAltTextFeedback({
          alt_text_result: altTextResultId,
          rating: "dislike",
        }).unwrap();
        setFeedbackState((prev) => ({
          ...prev,
          [altTextResultId]: {
            ...(prev[altTextResultId] || {}),
            dislikeId: created.id,
          },
        }));
        toast({
          title: "피드백이 반영되었습니다",
          description: "‘도움이 되지 않았어요’로 기록했어요.",
        });
      }
    } catch (e: any) {
      toast({
        title: "피드백 처리 실패",
        description: e?.message || "잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setSendingKey(null);
    }
  };

  const handleCopy = async (text: string, idForTip: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedOpenId(idForTip);
      setTimeout(
        () => setCopiedOpenId((prev) => (prev === idForTip ? null : prev)),
        1500
      );
    } catch {
      toast({
        title: "복사 실패",
        description: "클립보드 권한을 확인하고 다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  const FeedbackHoverContent = () => (
    <div className="w-[280px]">
      <div className="rounded-xl bg-[#f5f7fb] py-3 px-4 text-center font-semibold">
        이 대체텍스트가 도움이 되었나요?
      </div>
      <p className="mt-2 text-sm text-center text-gray-600">
        더 나은 결과를 위해 의견을 들려주세요.
      </p>
    </div>
  );

  const CopiedHoverContent = () => (
    <div className="w-[320px]">
      <div className="rounded-xl bg-[#f5f7fb] py-3 px-4 text-center font-semibold">
        대체텍스트 복사 완료
      </div>
      <p className="mt-2 text-sm text-center text-gray-600">
        alt 속성에 넣으면 더 많은 사람들이 콘텐츠를 이해할 수 있어요
      </p>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* … 상단 가이드는 동일 … */}
      {/* 상단 가이드: 그대로 유지 */}
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
      {results.map((result, index) => {
        const fb = feedbackState[result.id] || {};
        const isLiked = !!fb.likeId;
        const isDisliked = !!fb.dislikeId;

        return (
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
              {/* … 이미지/정보 섹션 동일 … */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <label className="block mb-1 text-xs font-medium text-gray-500">
                    이미지 미리보기
                  </label>
                  <div className="relative flex items-center justify-center w-32 h-24 overflow-hidden border rounded bg-gray-50">
                    <img
                      src={getAbsoluteImageUrl(result.img_url, scanUrl ?? "")}
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
                      {result.element_html.length > 100
                        ? result.element_html.substring(0, 100) + "..."
                        : result.element_html}
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

              {/* --- 제안 박스 --- */}
              {result.suggested_alt && (
                <div className="p-3 border border-blue-200 rounded bg-blue-50">
                  <div className="flex items-center justify-between mb-2">
                    {/* 좌측: 라벨 + 복사 */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-blue-700">
                        ⭐ WEBridge AI 대체텍스트 제안
                      </span>

                      <HoverCard
                        open={copiedOpenId === result.id}
                        onOpenChange={(o) => !o && setCopiedOpenId(null)}
                      >
                        <HoverCardTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 px-2 text-xs"
                            onClick={() =>
                              handleCopy(
                                `alt="${result.suggested_alt}"`,
                                result.id
                              )
                            }
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            복사
                          </Button>
                        </HoverCardTrigger>
                        <HoverCardContent align="start" className="w-auto">
                          <CopiedHoverContent />
                        </HoverCardContent>
                      </HoverCard>
                    </div>

                    {/* 우측: 좋아요/싫어요 (서로 독립 토글) */}
                    <div className="flex items-center gap-1">
                      <HoverCard openDelay={150}>
                        <HoverCardTrigger asChild>
                          <button
                            aria-label="도움이 되었어요"
                            className={`p-2 rounded-full transition hover:bg-blue-100/60 ${
                              isLiked
                                ? "text-blue-600 bg-blue-100"
                                : "text-gray-700"
                            }`}
                            onClick={() => toggleLike(result.id)}
                            disabled={sendingKey === `${result.id}:like`}
                          >
                            <ThumbsUp className="w-5 h-5" />
                          </button>
                        </HoverCardTrigger>
                        <HoverCardContent align="end" className="w-auto">
                          <FeedbackHoverContent />
                        </HoverCardContent>
                      </HoverCard>

                      <HoverCard openDelay={150}>
                        <HoverCardTrigger asChild>
                          <button
                            aria-label="도움이 되지 않았어요"
                            className={`p-2 rounded-full transition hover:bg-red-100/60 ${
                              isDisliked
                                ? "text-red-600 bg-red-100"
                                : "text-gray-700"
                            }`}
                            onClick={() => toggleDislike(result.id)}
                            disabled={sendingKey === `${result.id}:dislike`}
                          >
                            <ThumbsDown className="w-5 h-5" />
                          </button>
                        </HoverCardTrigger>
                        <HoverCardContent align="end" className="w-auto">
                          <FeedbackHoverContent />
                        </HoverCardContent>
                      </HoverCard>
                    </div>
                  </div>

                  <div className="p-2 font-mono text-sm text-blue-800 bg-white border rounded">
                    alt="{result.suggested_alt}"
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AltTextDetail;
