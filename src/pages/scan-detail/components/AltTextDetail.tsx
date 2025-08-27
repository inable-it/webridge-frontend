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

const AltTextDetail = ({ results }: Props) => {
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
