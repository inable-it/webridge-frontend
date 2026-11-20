import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
    Copy,
    Sparkles,
    ThumbsUp,
    ThumbsDown,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import type { AltTextResult } from "@/features/api/scanApi";
import { isAltTextCompliant } from "@/utils/altText";
import {
    useCreateAltTextFeedbackMutation,
    useDeleteAltTextFeedbackMutation,
} from "@/features/api/altTextFeedbackApi";

type Props = {
    results: AltTextResult[];
    scanUrl?: string;
};

// ===== 미준수 사유 분류 =====
type AltIssueType = "missing" | "empty" | "inappropriate";

const ALT_ISSUE_MESSAGES: Record<AltIssueType, { title: string; description: string }> = {
    missing: {
        title: "alt 속성이 존재하지 않습니다.",
        description: "모든 의미있는 이미지에는 alt 속성을 반드시 입력해야 해요.",
    },
    empty: {
        title: "alt 값에 대체텍스트가 존재하지 않습니다.",
        description: "장식 요소로 존재하는 이미지가 아니라면, alt 값에는 적절한 이미지 설명을 작성해야 해요.",
    },
    inappropriate: {
        title: "alt 값에 적절하지 않은 대체텍스트가 존재합니다.",
        description: "이미지와 맥락을 충분히 설명할 수 있는 대체텍스트를 작성해야 해요.",
    },
};

/**
 * 소스 코드(element_html)에서 alt 속성 값을 추출
 * - undefined: alt 속성 자체가 없음
 * - string: alt 속성 값 (빈 문자열 포함)
 * - null: 판단 불가 (HTML 파싱 실패)
 */
const extractAltAttr = (elementHtml?: string): string | undefined | null => {
    if (!elementHtml) return null;
    try {
        const doc = new DOMParser().parseFromString(elementHtml, "text/html");
        const el = doc.body.querySelector("img, input, area") ?? doc.body.firstElementChild;
        if (!el) return null;
        return el.hasAttribute("alt") ? el.getAttribute("alt") ?? "" : undefined;
    } catch {
        return null;
    }
};

const getAltIssueType = (result: AltTextResult): AltIssueType | null => {
    const isCompliant = isAltTextCompliant(result.compliance);
    if (isCompliant) return null;

    const hasAltTextValue = (result.alt_text ?? "").trim() !== "";
    if (hasAltTextValue) {
        return result.compliance === 2 ? "inappropriate" : null;
    }

    const altAttr = extractAltAttr(result.element_html);
    if (altAttr === undefined) return "missing";
    if (typeof altAttr === "string" && altAttr.trim() === "") return "empty";
    if (altAttr === null) return "empty";

    return result.compliance === 2 ? "inappropriate" : null;
};

const formatCurrentAlt = (result: AltTextResult) => {
    const hasAltTextValue = (result.alt_text ?? "").trim() !== "";
    const altAttr = extractAltAttr(result.element_html);
    if (!hasAltTextValue && altAttr === undefined) return "alt 속성 없음";
    const value = typeof altAttr === "string" && altAttr !== "" ? altAttr : result.alt_text ?? "";
    return `alt="${value}"`;
};

// 각 result.id 별로 like/dislike 각각의 feedback id를 별도로 저장
type FeedbackState = Record<number, { likeId?: number; dislikeId?: number }>;

const AltTextDetail = ({ results, scanUrl }: Props) => {
    const [copiedOpenId, setCopiedOpenId] = useState<number | null>(null);
    const [filter, setFilter] = useState<'compliant' | 'non-compliant'>('non-compliant');

    // 현재 어떤 버튼이 전송 중인지 구분 (예: "123:like" / "123:dislike")
    const [sendingKey, setSendingKey] = useState<string | null>(null);

    // 독립 토글을 위한 로컬 상태
    const [feedbackState, setFeedbackState] = useState<FeedbackState>({});

    const [createAltTextFeedback] = useCreateAltTextFeedbackMutation();
    const [deleteAltTextFeedback] = useDeleteAltTextFeedbackMutation();

    // Space 처리 후 합성 click 1회 억제용 플래그
    const suppressClickRef = useRef<Record<string, boolean>>({});
    // 진행 중 토글에 대해 이어서 한 번 더(즉시 취소/재토글) 실행하려는 큐 표시
    const queuedToggleRef = useRef<Record<string, boolean>>({});
    // 진행 중 여부(버튼 disabled 대신 내부 가드)
    const pendingRef = useRef<Record<string, boolean>>({});

    const runOrQueue = async (key: string, action: () => Promise<void>) => {
        if (pendingRef.current[key]) {
            // 이미 진행 중이면 이후 한 번 더 수행하도록 큐잉
            queuedToggleRef.current[key] = true;
            return;
        }
        pendingRef.current[key] = true;
        setSendingKey(key);
        try {
            await action();
        } finally {
            setSendingKey(null);
            pendingRef.current[key] = false;
            if (queuedToggleRef.current[key]) {
                // 큐가 있으면 한 번만 즉시 재수행 후 큐 해제
                queuedToggleRef.current[key] = false;
                // 재귀 재진입(한 번만)
                runOrQueue(key, action);
            }
        }
    };

    const toggleLike = async (altTextResultId: number) => {
        const key = `${altTextResultId}:like`;
        await runOrQueue(key, async () => {
            const current = feedbackState[altTextResultId];
            const isActive = !!current?.likeId;
            if (isActive) {
                await deleteAltTextFeedback(current!.likeId!).unwrap();
                setFeedbackState((prev) => {
                    const next = { ...(prev[altTextResultId] || {}) };
                    delete next.likeId;
                    return { ...prev, [altTextResultId]: next };
                });
            } else {
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
        });
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
        await runOrQueue(key, async () => {
            const current = feedbackState[altTextResultId];
            const isActive = !!current?.dislikeId;
            if (isActive) {
                await deleteAltTextFeedback(current!.dislikeId!).unwrap();
                setFeedbackState((prev) => {
                    const next = { ...(prev[altTextResultId] || {}) };
                    delete next.dislikeId;
                    return { ...prev, [altTextResultId]: next };
                });
            } else {
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
        });
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
        <div className="w-[280px] text-gray-900">
            <div className="px-4 py-3 font-semibold text-center bg-gray-100 rounded-xl">
                이 대체 텍스트가 도움이 되었나요?
            </div>
            <p className="mt-2 text-sm text-center text-gray-600">
                더 나은 결과를 위해 의견을 들려주세요.
            </p>
        </div>
    );

    const CopiedHoverContent = () => (
        <div className="w-[320px] text-gray-900">
            <div className="px-4 py-3 font-semibold text-center bg-gray-100 rounded-xl">
                대체텍스트 복사 완료
            </div>
            <p className="mt-2 text-sm text-center text-gray-600">
                alt 속성에 넣으면 더 많은 사람들이 콘텐츠를 이해할 수 있어요
            </p>
        </div>
    );

    // 필터링된 결과
    const filteredResults = results.filter(result => {
        const isCompliant = isAltTextCompliant(result.compliance);
        return filter === 'compliant' ? isCompliant : !isCompliant;
    });

    return (
        <div className="space-y-6">
            {/* 수정 가이드 (피그마: 별도 카드 박스) */}
            <div className="p-6 bg-white border border-[#727272] rounded-lg shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                    수정 가이드
                </h3>
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-bold text-gray-900">
                        ℹ️ WEBridge는 [적절한 대체 텍스트 제공] 미준수 여부를 다음 기준으로 확인해요.
                    </span>
                </div>
                <ul className="space-y-1 text-sm text-gray-800">
                    <li>• 이미지에 alt 속성이 아예 없는 경우</li>
                    <li>• 이미지에 alt 속성값이 이유없이 비어있는 경우</li>
                    <li>• 이미지에 입력된 대체 텍스트가 이미지의 의미와 맞지 않는 경우</li>
                </ul>
                <div className="flex items-center gap-2 mt-4 mb-2">
                    <span className="text-sm font-bold text-gray-900">
                        ℹ️ 오류 항목을 수정하기 위해 아래 내용을 준수해야 해요.
                    </span>
                </div>
                <ul className="space-y-1 text-sm text-gray-800">
                    <li>• 모든 의미있는 이미지에는 alt 속성을 통해 대체텍스트를 입력해야 해요.</li>
                    <li>• 대체텍스트는 이미지의 의미나 용도를 동등하게 인식할 수 있도록 작성해야 해요.</li>
                    <li>• 대체텍스트는 간단명료하게 제공하는 것이 좋아요.</li>
                </ul>
                <div className="flex items-center gap-2 mt-4 mb-2">
                    <span className="text-sm font-bold text-gray-900">
                        💡 WEBridge 검사 이외에 이런 점도 고려해야 해요.
                    </span>
                </div>
                <ul className="space-y-1 text-sm text-gray-800">
                    <li>• 이미지 외에도 동영상 등의 텍스트가 아닌 콘텐츠에도 대체 텍스트가 필요해요.</li>
                    <li>• 수어 영상처럼 이미 내용을 전달하고 있는 콘텐츠에는 대체 텍스트를 따로 넣지 않아도 괜찮아요.</li>
                    <li>• 장식용 이미지는 alt를 빈값으로 설정하면, 보조기술이 불필요한 정보를 건너뛸 수 있어요.</li>
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
                        aria-pressed={filter === 'compliant'}
                        onClick={() => setFilter('compliant')}
                        className={`text-xs px-4 rounded-md ${
                            filter === 'compliant'
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'bg-[#6B7280] hover:bg-[#5B6270] text-white'
                        }`}
                    >
                        준수
                    </Button>
                    <Button
                        size="sm"
                        aria-pressed={filter === 'non-compliant'}
                        onClick={() => setFilter('non-compliant')}
                        className={`text-xs px-4 rounded-md ${
                            filter === 'non-compliant'
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'bg-[#6B7280] hover:bg-[#5B6270] text-white'
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
                            const fb = feedbackState[result.id] || {};
                            const isLiked = !!fb.likeId;
                            const isDisliked = !!fb.dislikeId;
                            const isCompliant = isAltTextCompliant(result.compliance);
                            const issueType = getAltIssueType(result);
                            const aiSuggestion =
                                result.ai_improvement || result.answer || result.suggested_alt;

                            return (
                                <div key={result.id} className="flex items-start gap-3">
                                    {/* 좌측 순번 박스 */}
                                    <div className="flex items-center justify-center w-8 h-8 text-sm font-medium text-gray-900 bg-white border border-[#727272] rounded shrink-0">
                                        {index + 1}
                                    </div>

                                    {/* 우측 결과 카드 */}
                                    <div className="flex-1 p-5 space-y-3 bg-white border border-[#727272] rounded-lg">
                                        {/* 1 & 2: 이미지 미리보기 + HTML 소스 코드 */}
                                        <div className="flex items-center gap-6 p-4 bg-white border border-gray-300 rounded">
                                            <div className="relative flex items-center justify-center w-32 h-24 overflow-hidden rounded bg-gray-50 shrink-0">
                                                <img
                                                    src={getAbsoluteImageUrl(result.img_url, scanUrl ?? "")}
                                                    alt="검사 대상 이미지"
                                                    className="object-contain max-w-full max-h-full"
                                                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                                                        const target = e.currentTarget;
                                                        target.style.display = "none";
                                                        const next = target.nextElementSibling as HTMLElement | null;
                                                        if (next) next.style.display = "flex";
                                                    }}
                                                />
                                                <div className="absolute inset-0 items-center justify-center hidden p-2 text-xs text-center text-gray-700">
                                                    <div>
                                                        <div className="mb-1">🖼️</div>
                                                        <div>이미지를 불러올 수 없습니다</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex-1 font-mono text-sm text-gray-800 break-all">
                                                {result.element_html}
                                            </div>
                                        </div>

                                        {/* 3: 현재 입력된 대체텍스트 */}
                                        <div className="p-4 rounded bg-[#E5E7EB]">
                                            <div className="text-xs font-bold text-gray-900">
                                                현재 입력된 대체텍스트
                                            </div>
                                            <div className="mt-1 font-mono text-sm text-gray-900 break-all">
                                                {formatCurrentAlt(result)}
                                            </div>
                                        </div>

                                        {/* 7: 미준수 사유 (미준수 탭에서만 표시) */}
                                        {issueType && (
                                            <div className="p-4 bg-white border-2 border-red-500 rounded">
                                                <p className="flex items-center gap-1.5 text-sm font-bold text-gray-900">
                                                    <span aria-hidden="true">⚠</span>
                                                    <span className="sr-only">미준수 사유: </span>
                                                    {ALT_ISSUE_MESSAGES[issueType].title}
                                                </p>
                                                <p className="mt-1 text-sm text-gray-800">
                                                    {ALT_ISSUE_MESSAGES[issueType].description}
                                                </p>
                                            </div>
                                        )}

                                        {/* 4, 5, 6: WEBridge AI 대체텍스트 제안 (다크 박스) */}
                                        {aiSuggestion && (
                                            <div className="p-4 text-white rounded bg-[#22252A]">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#3B82F6]">
                                                        <Sparkles className="w-4 h-4 shrink-0" />
                                                        <span>
                                                            {isCompliant
                                                                ? "이렇게도 작성할 수 있어요  -  WEBridge AI 대체텍스트 제안"
                                                                : "WEBridge AI 대체텍스트 제안"}
                                                        </span>
                                                    </div>

                                                    {/* 6: 좋아요/싫어요 */}
                                                    <div className="flex items-center gap-1">
                                                        <HoverCard openDelay={150}>
                                                            <HoverCardTrigger asChild>
                                                                <button
                                                                    type="button"
                                                                    aria-label="도움이 되었어요"
                                                                    aria-pressed={isLiked}
                                                                    aria-keyshortcuts="Space"
                                                                    className={`p-1.5 rounded-full transition hover:bg-white/10 border ${
                                                                        isLiked
                                                                            ? "text-blue-400 border-blue-400"
                                                                            : "text-gray-300 border-transparent"
                                                                    }`}
                                                                    onClick={() => toggleLike(result.id)}
                                                                    onClickCapture={(e) => {
                                                                        const k = `${result.id}:like`;
                                                                        if (suppressClickRef.current[k]) {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            suppressClickRef.current[k] = false;
                                                                        }
                                                                    }}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === " " || e.key === "Spacebar" || e.code === "Space") {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            const k = `${result.id}:like`;
                                                                            suppressClickRef.current[k] = true;
                                                                            toggleLike(result.id);
                                                                        }
                                                                    }}
                                                                    onKeyUp={(e) => {
                                                                        if (e.key === " " || e.key === "Spacebar" || e.code === "Space") {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                        }
                                                                    }}
                                                                    aria-busy={sendingKey === `${result.id}:like` || undefined}
                                                                >
                                                                    <ThumbsUp className="w-4 h-4" />
                                                                </button>
                                                            </HoverCardTrigger>
                                                            <HoverCardContent align="end" className="w-auto">
                                                                <FeedbackHoverContent />
                                                            </HoverCardContent>
                                                        </HoverCard>

                                                        <HoverCard openDelay={150}>
                                                            <HoverCardTrigger asChild>
                                                                <button
                                                                    type="button"
                                                                    aria-label="도움이 되지 않았어요"
                                                                    aria-pressed={isDisliked}
                                                                    aria-keyshortcuts="Space"
                                                                    className={`p-1.5 rounded-full transition hover:bg-white/10 border ${
                                                                        isDisliked
                                                                            ? "text-red-400 border-red-400"
                                                                            : "text-gray-300 border-transparent"
                                                                    }`}
                                                                    onClick={() => toggleDislike(result.id)}
                                                                    onClickCapture={(e) => {
                                                                        const k = `${result.id}:dislike`;
                                                                        if (suppressClickRef.current[k]) {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            suppressClickRef.current[k] = false;
                                                                        }
                                                                    }}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === " " || e.key === "Spacebar" || e.code === "Space") {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            const k = `${result.id}:dislike`;
                                                                            suppressClickRef.current[k] = true;
                                                                            toggleDislike(result.id);
                                                                        }
                                                                    }}
                                                                    onKeyUp={(e) => {
                                                                        if (e.key === " " || e.key === "Spacebar" || e.code === "Space") {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                        }
                                                                    }}
                                                                    aria-busy={sendingKey === `${result.id}:dislike` || undefined}
                                                                >
                                                                    <ThumbsDown className="w-4 h-4" />
                                                                </button>
                                                            </HoverCardTrigger>
                                                            <HoverCardContent align="end" className="w-auto">
                                                                <FeedbackHoverContent />
                                                            </HoverCardContent>
                                                        </HoverCard>
                                                    </div>
                                                </div>

                                                {/* 4 & 5: 제안된 alt 텍스트 + 인라인 복사 아이콘 */}
                                                <div className="flex items-center gap-2 font-mono text-sm text-gray-100">
                                                    <span className="break-all">
                                                        alt="{aiSuggestion}"
                                                    </span>

                                                    <HoverCard
                                                        open={copiedOpenId === result.id}
                                                        onOpenChange={(o) => !o && setCopiedOpenId(null)}
                                                    >
                                                        <HoverCardTrigger asChild>
                                                            <button
                                                                type="button"
                                                                aria-label="제안된 대체텍스트 복사"
                                                                className="p-1 text-gray-300 transition rounded hover:text-white hover:bg-white/10 shrink-0"
                                                                onClick={() => handleCopy(`alt="${aiSuggestion}"`, result.id)}
                                                            >
                                                                <Copy className="w-4 h-4" />
                                                            </button>
                                                        </HoverCardTrigger>
                                                        <HoverCardContent align="start" className="w-auto">
                                                            <CopiedHoverContent />
                                                        </HoverCardContent>
                                                    </HoverCard>
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

export default AltTextDetail;