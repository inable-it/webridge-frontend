import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronRight, Loader2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePdfGenerator } from "@/hooks/usePdfGenerator";
import {
    useCreateScanMutation,
    useGetScanListQuery,
    useGetScanDetailQuery,
} from "@/features/api/scanApi";
import { toast } from "@/hooks/use-toast";
import SurveyModal from "@/components/common/SurveyModal";

const DashboardPage = () => {
    const [urlInput, setUrlInput] = useState("");
    const [progressingScanIds, setProgressingScanIds] = useState<string[]>([]);
    const [selectedScanId, setSelectedScanId] = useState<string | null>(null);
    const { generatePdf } = usePdfGenerator();
    const navigate = useNavigate();
    const [openSurvey, setOpenSurvey] = useState(false);

    // 이미 모달을 표시했는지 추적하는 ref
    const hasCheckedResults = useRef(false);

    // API hooks
    const [createScan, { isLoading: isCreating }] = useCreateScanMutation();
    const {
        data: scanListData,
        isLoading: isLoadingList,
        refetch: refetchScanList,
    } = useGetScanListQuery({
        page: 1,
        page_size: 5,
        ordering: "-created_at",
    });

    // 선택된 스캔의 상세 정보 조회
    const { data: selectedScanDetail, refetch } = useGetScanDetailQuery(
        selectedScanId!,
        {
            skip: !selectedScanId,
        }
    );

    // 진행 중인 스캔들 추적
    useEffect(() => {
        if (scanListData?.results) {
            const progressingIds = scanListData.results
                .filter(
                    (scan) => scan.status === "processing" || scan.status === "pending"
                )
                .map((scan) => scan.id);
            setProgressingScanIds(progressingIds);

            // 1. 페이지 로딩 시 자동으로 최신 검사 결과 선택
            if (!selectedScanId && scanListData.results.length > 0) {
                setSelectedScanId(scanListData.results[0].id);
            }
        }
    }, [scanListData, selectedScanId]);

    // 스캔 결과 확인 후 모달 표시 (한 번만)
    useEffect(() => {
        if (!hasCheckedResults.current && scanListData !== undefined) {
            const hasResults = (scanListData?.results?.length ?? 0) > 0;
            setOpenSurvey(hasResults);
            hasCheckedResults.current = true;
        }
    }, [scanListData]);

    // 진행 중인 스캔들에 대한 진행률 조회 (폴링)
    useEffect(() => {
        let interval: number | null = null;

        if (progressingScanIds.length > 0) {
            interval = window.setInterval(() => {
                refetchScanList().catch(err => console.error("Refetch list error:", err));
            }, 2000); // 2초마다 업데이트
        }

        return () => {
            if (interval !== null) {
                window.clearInterval(interval);
            }
        };
    }, [progressingScanIds, refetchScanList]);

    // 4. 선택된 스캔이 진행 중인 경우 상세 정보도 실시간 업데이트
    useEffect(() => {
        let interval: number | null = null;

        if (
            selectedScanId &&
            selectedScanDetail &&
            (selectedScanDetail.status === "processing" ||
                selectedScanDetail.status === "pending")
        ) {
            interval = window.setInterval(() => {
                refetch().catch(err => console.error("Refetch error:", err));
            }, 2000);
        }

        return () => {
            if (interval !== null) {
                window.clearInterval(interval);
            }
        };
    }, [selectedScanId, selectedScanDetail?.status, refetch]);

    // URL 검증 함수
    const isValidUrl = (url: string): boolean => {
        try {
            new URL(url);
            return url.startsWith("http://") || url.startsWith("https://");
        } catch {
            return false;
        }
    };

    // 설문 모달 닫기
    const closeSurvey = () => {
        setOpenSurvey(false);
    };

    // 스캔 시작 핸들러
    const handleStartScan = async () => {
        if (!urlInput.trim()) {
            toast({ title: "오류", description: "URL을 입력해주세요." });
            return;
        }
        if (!isValidUrl(urlInput)) {
            toast({
                title: "오류",
                description:
                    "올바른 URL 형식을 입력해주세요. (http:// 또는 https://로 시작)",
            });
            return;
        }

        try {
            const result = await createScan({ url: urlInput }).unwrap();
            toast({
                title: "검사 시작",
                description: "웹 접근성 검사가 시작되었습니다!",
            });
            setUrlInput("");
            setSelectedScanId(result.scan.id);
            refetchScanList();
        } catch (error: any) {
            console.error("스캔 생성 실패:", error);
            toast({
                title: "오류",
                description: error?.data?.message || "검사 시작에 실패했습니다.",
            });
        }
    };

    // 스캔 항목 클릭 핸들러
    const handleScanItemClick = (scanId: string) => {
        setSelectedScanId(scanId);
    };

    // 스캔 상태에 따른 표시 색상과 텍스트
    const getStatusDisplay = (scan: any) => {
        switch (scan.status) {
            case "completed":
                return { color: "text-green-600", text: scan.status_display };
            case "processing":
                return {
                    color: "text-blue-600",
                    text: `진행중 (${Math.round(scan.completion_percentage || 0)}%)`,
                };
            case "pending":
                return { color: "text-yellow-600", text: "대기중 (0%)" };
            case "failed":
                return { color: "text-red-600", text: scan.status_display };
            default:
                return { color: "text-gray-600", text: scan.status_display };
        }
    };

    // 현재 표시할 스캔 데이터
    const displayScan =
        selectedScanDetail ||
        (scanListData?.results?.[0] ? scanListData.results[0] : null);
    const isDisplayingScanDetail = !!selectedScanDetail;

    // 기본 결과 데이터
    const defaultResultItems = [
        {
            id: 1,
            name: "적절한 대체 텍스트 제공",
            score: "검사 대기",
            type: "검사 시작",
            category: "alt_text",
        },
        {
            id: 2,
            name: "자막 제공",
            score: "검사 대기",
            type: "검사 시작",
            category: "video",
        },
        {
            id: 3,
            name: "표의 구성",
            score: "검사 대기",
            type: "검사 시작",
            category: "table",
        },
        {
            id: 4,
            name: "자동 재생 금지",
            score: "검사 대기",
            type: "검사 시작",
            category: "video",
        },
        {
            id: 5,
            name: "텍스트 콘텐츠의 명도 대비",
            score: "검사 대기",
            type: "검사 시작",
            category: "contrast",
        },
        {
            id: 6,
            name: "키보드 사용 보장",
            score: "검사 대기",
            type: "검사 시작",
            category: "keyboard",
        },
        {
            id: 7,
            name: "레이블 제공",
            score: "검사 대기",
            type: "검사 시작",
            category: "label",
        },
        {
            id: 8,
            name: "마크업 오류 방지",
            score: "검사 대기",
            type: "검사 시작",
            category: "markup_error",
        },
        {
            id: 9,
            name: "기본 언어 표시",
            score: "검사 대기",
            type: "검사 시작",
            category: "basic_language",
        },
        {
            id: 10,
            name: "제목 제공",
            score: "검사 대기",
            type: "검사 시작",
            category: "heading",
        },
        {
            id: 11,
            name: "응답 시간 조절",
            score: "검사 대기",
            type: "검사 시작",
            category: "response_time",
        },
        {
            id: 12,
            name: "정지 기능 제공",
            score: "검사 대기",
            type: "검사 시작",
            category: "pause_control",
        },
        {
            id: 13,
            name: "깜빡임과 번쩍임 사용 제한",
            score: "검사 대기",
            type: "검사 시작",
            category: "flashing",
        },
    ];

    // 스캔 결과를 기반으로 한 테이블 데이터 생성
    const getResultItems = () => {
        if (!displayScan) return defaultResultItems;

        if (displayScan.status === "pending") {
            return defaultResultItems.map((item) => ({
                ...item,
                score: "검사 대기중",
                type: "대기",
            }));
        }

        if (displayScan.status === "processing") {
            const progressResults = [
                {
                    id: 1,
                    name: "적절한 대체 텍스트 제공",
                    score: selectedScanDetail?.alt_text_completed
                        ? selectedScanDetail?.alt_text_results
                            ? `${
                                selectedScanDetail.alt_text_results.filter(
                                    (r) => r.compliance === 0
                                ).length
                            }/${selectedScanDetail.alt_text_results.length}`
                            : "검사 완료"
                        : "검사중...",
                    type: selectedScanDetail?.alt_text_completed ? "오류 확인" : "진행중",
                    hasIssues:
                        selectedScanDetail?.alt_text_results?.some(
                            (r) => r.compliance !== 0
                        ) || false,
                    category: "alt_text",
                },
                {
                    id: 2,
                    name: "자막 제공",
                    score: selectedScanDetail?.video_completed
                        ? selectedScanDetail?.video_results
                            ? `${
                                selectedScanDetail.video_results.filter(
                                    (r) => r.has_transcript
                                ).length
                            }/${selectedScanDetail.video_results.length}`
                            : "검사 완료"
                        : "검사중...",
                    type: selectedScanDetail?.video_completed ? "오류 확인" : "진행중",
                    hasIssues:
                        selectedScanDetail?.video_results?.some((r) => !r.has_transcript) ||
                        false,
                    category: "video",
                },
                {
                    id: 3,
                    name: "표의 구성",
                    score: selectedScanDetail?.table_completed
                        ? selectedScanDetail?.table_results
                            ? `${
                                selectedScanDetail.table_results.filter((r) => r.compliant)
                                    .length
                            }/${selectedScanDetail.table_results.length}`
                            : "검사 완료"
                        : "검사중...",
                    type: selectedScanDetail?.table_completed ? "오류 확인" : "진행중",
                    hasIssues:
                        selectedScanDetail?.table_results?.some((r) => !r.compliant) ||
                        false,
                    category: "table",
                },
                {
                    id: 4,
                    name: "자동 재생 금지",
                    score: selectedScanDetail?.video_completed
                        ? selectedScanDetail?.video_results
                            ? `${
                                selectedScanDetail.video_results.filter(
                                    (r) => r.autoplay_disabled
                                ).length
                            }/${selectedScanDetail.video_results.length}`
                            : "검사 완료"
                        : "검사중...",
                    type: selectedScanDetail?.video_completed ? "오류 확인" : "진행중",
                    hasIssues:
                        selectedScanDetail?.video_results?.some(
                            (r) => !r.autoplay_disabled
                        ) || false,
                    category: "video",
                },
                {
                    id: 5,
                    name: "텍스트 콘텐츠의 명도 대비",
                    score: selectedScanDetail?.contrast_completed
                        ? selectedScanDetail?.contrast_results
                            ? `${
                                selectedScanDetail.contrast_results.filter(
                                    (r) => r.wcag_compliant
                                ).length
                            }/${selectedScanDetail.contrast_results.length}`
                            : "검사 완료"
                        : "검사중...",
                    type: selectedScanDetail?.contrast_completed ? "오류 확인" : "진행중",
                    hasIssues:
                        selectedScanDetail?.contrast_results?.some(
                            (r) => !r.wcag_compliant
                        ) || false,
                    category: "contrast",
                },
                {
                    id: 6,
                    name: "키보드 사용 보장",
                    score: selectedScanDetail?.keyboard_completed
                        ? selectedScanDetail?.keyboard_results
                            ? `${
                                selectedScanDetail.keyboard_results.filter(
                                    (r) => r.accessible
                                ).length
                            }/${selectedScanDetail.keyboard_results.length}`
                            : "검사 완료"
                        : "검사중...",
                    type: selectedScanDetail?.keyboard_completed ? "오류 확인" : "진행중",
                    hasIssues:
                        selectedScanDetail?.keyboard_results?.some((r) => !r.accessible) ||
                        false,
                    category: "keyboard",
                },
                {
                    id: 7,
                    name: "레이블 제공",
                    score: selectedScanDetail?.label_completed
                        ? selectedScanDetail?.label_results
                            ? `${
                                selectedScanDetail.label_results.filter(
                                    (r) => r.label_present
                                ).length
                            }/${selectedScanDetail.label_results.length}`
                            : "검사 완료"
                        : "검사중...",
                    type: selectedScanDetail?.label_completed ? "오류 확인" : "진행중",
                    hasIssues:
                        selectedScanDetail?.label_results?.some((r) => !r.label_present) ||
                        false,
                    category: "label",
                },
                {
                    id: 8,
                    name: "마크업 오류 방지",
                    score: selectedScanDetail?.markup_error_completed
                        ? selectedScanDetail?.markup_error_results
                            ? `${
                                selectedScanDetail.markup_error_results.filter(
                                    (r) => r.compliant
                                ).length
                            }/${selectedScanDetail.markup_error_results.length}`
                            : "검사 완료"
                        : "검사중...",
                    type: selectedScanDetail?.markup_error_completed
                        ? "오류 확인"
                        : "진행중",
                    hasIssues:
                        selectedScanDetail?.markup_error_results?.some(
                            (r) => !r.compliant
                        ) || false,
                    category: "markup_error",
                },
                {
                    id: 9,
                    name: "기본 언어 표시",
                    score: selectedScanDetail?.basic_language_completed
                        ? selectedScanDetail?.basic_language_results
                            ? `${
                                selectedScanDetail.basic_language_results.filter(
                                    (r) => r.compliant
                                ).length
                            }/${selectedScanDetail.basic_language_results.length}`
                            : "검사 완료"
                        : "검사중...",
                    type: selectedScanDetail?.basic_language_completed
                        ? "오류 확인"
                        : "진행중",
                    hasIssues:
                        selectedScanDetail?.basic_language_results?.some(
                            (r) => !r.compliant
                        ) || false,
                    category: "basic_language",
                },
                {
                    id: 10,
                    name: "제목 제공",
                    score: selectedScanDetail?.heading_completed
                        ? selectedScanDetail?.heading_results
                            ? `${
                                selectedScanDetail.heading_results.filter((r) => r.compliant)
                                    .length
                            }/${selectedScanDetail.heading_results.length}`
                            : "검사 완료"
                        : "검사중...",
                    type: selectedScanDetail?.heading_completed ? "오류 확인" : "진행중",
                    hasIssues:
                        selectedScanDetail?.heading_results?.some((r) => !r.compliant) ||
                        false,
                    category: "heading",
                },
                {
                    id: 11,
                    name: "응답 시간 조절",
                    score: selectedScanDetail?.response_time_completed
                        ? selectedScanDetail?.response_time_results
                            ? `${
                                selectedScanDetail.response_time_results.filter(
                                    (r) => r.compliant
                                ).length
                            }/${selectedScanDetail.response_time_results.length}`
                            : "검사 완료"
                        : "검사중...",
                    type: selectedScanDetail?.response_time_completed
                        ? "오류 확인"
                        : "진행중",
                    hasIssues:
                        selectedScanDetail?.response_time_results?.some(
                            (r) => !r.compliant
                        ) || false,
                    category: "response_time",
                },
                {
                    id: 12,
                    name: "정지 기능 제공",
                    score: selectedScanDetail?.pause_control_completed
                        ? selectedScanDetail?.pause_control_results
                            ? `${
                                selectedScanDetail.pause_control_results.filter(
                                    (r) => r.compliant
                                ).length
                            }/${selectedScanDetail.pause_control_results.length}`
                            : "검사 완료"
                        : "검사중...",
                    type: selectedScanDetail?.pause_control_completed
                        ? "오류 확인"
                        : "진행중",
                    hasIssues:
                        selectedScanDetail?.pause_control_results?.some(
                            (r) => !r.compliant
                        ) || false,
                    category: "pause_control",
                },
                {
                    id: 13,
                    name: "깜빡임과 번쩍임 사용 제한",
                    score: selectedScanDetail?.flashing_completed
                        ? selectedScanDetail?.flashing_results
                            ? `${
                                selectedScanDetail.flashing_results.filter((r) => r.compliant)
                                    .length
                            }/${selectedScanDetail.flashing_results.length}`
                            : "검사 완료"
                        : "검사중...",
                    type: selectedScanDetail?.flashing_completed ? "오류 확인" : "진행중",
                    hasIssues:
                        selectedScanDetail?.flashing_results?.some((r) => !r.compliant) ||
                        false,
                    category: "flashing",
                },
            ];
            return progressResults;
        }

        if (displayScan.status !== "completed" || !isDisplayingScanDetail)
            return defaultResultItems;

        // 완료된 스캔의 실제 결과
        const results = [
            {
                id: 1,
                name: "적절한 대체 텍스트 제공",
                score: selectedScanDetail?.alt_text_results
                    ? `${
                        selectedScanDetail.alt_text_results.filter(
                            (r) => r.compliance === 0
                        ).length
                    }/${selectedScanDetail.alt_text_results.length}`
                    : "검사 대기",
                type: "오류 확인",
                hasIssues:
                    selectedScanDetail?.alt_text_results?.some(
                        (r) => r.compliance !== 0
                    ) || false,
                category: "alt_text",
            },
            {
                id: 2,
                name: "자막 제공",
                score: selectedScanDetail?.video_results
                    ? `${
                        selectedScanDetail.video_results.filter((r) => r.has_transcript)
                            .length
                    }/${selectedScanDetail.video_results.length}`
                    : "검사 대기",
                type: "오류 확인",
                hasIssues:
                    selectedScanDetail?.video_results?.some((r) => !r.has_transcript) ||
                    false,
                category: "video",
            },
            {
                id: 3,
                name: "표의 구성",
                score: selectedScanDetail?.table_results
                    ? `${
                        selectedScanDetail.table_results.filter((r) => r.compliant).length
                    }/${selectedScanDetail.table_results.length}`
                    : "검사 대기",
                type: "오류 확인",
                hasIssues:
                    selectedScanDetail?.table_results?.some((r) => !r.compliant) || false,
                category: "table",
            },
            {
                id: 4,
                name: "자동 재생 금지",
                score: selectedScanDetail?.video_results
                    ? `${
                        selectedScanDetail.video_results.filter(
                            (r) => r.autoplay_disabled
                        ).length
                    }/${selectedScanDetail.video_results.length}`
                    : "검사 대기",
                type: "오류 확인",
                hasIssues:
                    selectedScanDetail?.video_results?.some(
                        (r) => !r.autoplay_disabled
                    ) || false,
                category: "video",
            },
            {
                id: 5,
                name: "텍스트 콘텐츠의 명도 대비",
                score: selectedScanDetail?.contrast_results
                    ? `${
                        selectedScanDetail.contrast_results.filter(
                            (r) => r.wcag_compliant
                        ).length
                    }/${selectedScanDetail.contrast_results.length}`
                    : "검사 대기",
                type: "오류 확인",
                hasIssues:
                    selectedScanDetail?.contrast_results?.some(
                        (r) => !r.wcag_compliant
                    ) || false,
                category: "contrast",
            },
            {
                id: 6,
                name: "키보드 사용 보장",
                score: selectedScanDetail?.keyboard_results
                    ? `${
                        selectedScanDetail.keyboard_results.filter((r) => r.accessible)
                            .length
                    }/${selectedScanDetail.keyboard_results.length}`
                    : "검사 대기",
                type: "오류 확인",
                hasIssues:
                    selectedScanDetail?.keyboard_results?.some((r) => !r.accessible) ||
                    false,
                category: "keyboard",
            },
            {
                id: 7,
                name: "레이블 제공",
                score: selectedScanDetail?.label_results
                    ? `${
                        selectedScanDetail.label_results.filter((r) => r.label_present)
                            .length
                    }/${selectedScanDetail.label_results.length}`
                    : "검사 대기",
                type: "오류 확인",
                hasIssues:
                    selectedScanDetail?.label_results?.some((r) => !r.label_present) ||
                    false,
                category: "label",
            },
            {
                id: 8,
                name: "마크업 오류 방지",
                score: selectedScanDetail?.markup_error_results
                    ? `${
                        selectedScanDetail.markup_error_results.filter((r) => r.compliant)
                            .length
                    }/${selectedScanDetail.markup_error_results.length}`
                    : "검사 대기",
                type: "오류 확인",
                hasIssues:
                    selectedScanDetail?.markup_error_results?.some((r) => !r.compliant) ||
                    false,
                category: "markup_error",
            },
            {
                id: 9,
                name: "기본 언어 표시",
                score: selectedScanDetail?.basic_language_results
                    ? `${
                        selectedScanDetail.basic_language_results.filter(
                            (r) => r.compliant
                        ).length
                    }/${selectedScanDetail.basic_language_results.length}`
                    : "검사 대기",
                type: "오류 확인",
                hasIssues:
                    selectedScanDetail?.basic_language_results?.some(
                        (r) => !r.compliant
                    ) || false,
                category: "basic_language",
            },
            {
                id: 10,
                name: "제목 제공",
                score: selectedScanDetail?.heading_results
                    ? `${
                        selectedScanDetail.heading_results.filter((r) => r.compliant)
                            .length
                    }/${selectedScanDetail.heading_results.length}`
                    : "검사 대기",
                type: "오류 확인",
                hasIssues:
                    selectedScanDetail?.heading_results?.some((r) => !r.compliant) ||
                    false,
                category: "heading",
            },
            {
                id: 11,
                name: "응답 시간 조절",
                score: selectedScanDetail?.response_time_results
                    ? `${
                        selectedScanDetail.response_time_results.filter(
                            (r) => r.compliant
                        ).length
                    }/${selectedScanDetail.response_time_results.length}`
                    : "검사 대기",
                type: "오류 확인",
                hasIssues:
                    selectedScanDetail?.response_time_results?.some(
                        (r) => !r.compliant
                    ) || false,
                category: "response_time",
            },
            {
                id: 12,
                name: "정지 기능 제공",
                score: selectedScanDetail?.pause_control_results
                    ? `${
                        selectedScanDetail.pause_control_results.filter(
                            (r) => r.compliant
                        ).length
                    }/${selectedScanDetail.pause_control_results.length}`
                    : "검사 대기",
                type: "오류 확인",
                hasIssues:
                    selectedScanDetail?.pause_control_results?.some(
                        (r) => !r.compliant
                    ) || false,
                category: "pause_control",
            },
            {
                id: 13,
                name: "깜빡임과 번쩍임 사용 제한",
                score: selectedScanDetail?.flashing_results
                    ? `${
                        selectedScanDetail.flashing_results.filter((r) => r.compliant)
                            .length
                    }/${selectedScanDetail.flashing_results.length}`
                    : "검사 대기",
                type: "오류 확인",
                hasIssues:
                    selectedScanDetail?.flashing_results?.some((r) => !r.compliant) ||
                    false,
                category: "flashing",
            },
        ];

        return results;
    };

    const resultItems = getResultItems();

    return (
        <>
            <div className="flex h-screen bg-[#ecf3ff] p-8 gap-5">
                {/* 왼쪽: 최근 검사 + 최근 검사 내역 */}
                <div className="flex w-[320px] space-y-6 rounded-lg flex-col">
                    <div className="w-[320px] bg-[#f4f8ff] border-2 p-6 space-y-6 rounded-lg">
                        <div className="space-y-3">
                            <h2 className="text-lg font-semibold">접근성 검사</h2>
                            <div className="flex items-center gap-2">
                                <Input
                                    placeholder="https://"
                                    className="flex-1"
                                    value={urlInput}
                                    onChange={(e) => setUrlInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleStartScan();
                                    }}
                                    disabled={isCreating}
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={handleStartScan}
                                    disabled={isCreating || !urlInput.trim()}
                                >
                                    {isCreating ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <ChevronRight className="w-5 h-5" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="w-[320px] bg-[#f4f8ff] border-2 p-6 space-y-6 rounded-lg h-full">
                        <div className="space-y-2">
                            <p className="text-sm text-gray-500">최근 검사 내역</p>

                            {isLoadingList ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                </div>
                            ) : scanListData?.results?.length ? (
                                <div className="space-y-1">
                                    {scanListData.results.map((scan) => (
                                        <Button
                                            key={scan.id}
                                            variant="outline"
                                            className={`justify-between w-full p-3 h-auto ${
                                                selectedScanId === scan.id
                                                    ? "bg-blue-50 border-blue-300"
                                                    : ""
                                            }`}
                                            onClick={() => handleScanItemClick(scan.id)}
                                        >
                                            <div className="flex flex-col items-start text-left">
                        <span className="text-sm truncate max-w-[200px]">
                          {scan.title || scan.url}
                        </span>
                                                <div className="flex items-center gap-2 mt-1">
                          <span
                              className={`text-xs ${
                                  getStatusDisplay(scan).color
                              }`}
                          >
                            {getStatusDisplay(scan).text}
                          </span>
                                                    {scan.status === "completed" && (
                                                        <span className="text-xs text-gray-500">
                              {scan.total_issues}개 이슈
                            </span>
                                                    )}
                                                    {(scan.status === "processing" ||
                                                        scan.status === "pending") && (
                                                        <div className="w-8 h-1 overflow-hidden bg-gray-200 rounded-full">
                                                            <div
                                                                className="h-full transition-all duration-300 bg-blue-500"
                                                                style={{
                                                                    width: `${Math.round(
                                                                        scan.completion_percentage || 0
                                                                    )}%`,
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-gray-400" />
                                        </Button>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                                    <AlertCircle className="w-8 h-8 mb-2" />
                                    <p className="text-sm">검사 내역이 없습니다</p>
                                    <p className="text-xs">URL을 입력하여 검사를 시작해보세요</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 오른쪽: 검사 결과 */}
                <div className="flex-1 min-w-0 p-8 bg-white border-2 rounded-lg shadow-md">
                    {/* PDF 저장 버튼 */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex-1 min-w-0 mr-4">
                            <h1 className="text-xl font-semibold">
                                WEBridge 웹 접근성 검사 요약 보고서
                            </h1>
                            <p className="mt-1 text-sm text-gray-500 break-words">
                                {displayScan ? (
                                    <>
                                        홈페이지명 : {displayScan.title} <br />
                                        <span className="break-all">{displayScan.url}</span>
                                    </>
                                ) : (
                                    <>
                                        홈페이지명 : 검사를 시작해주세요 <br />
                                        URL을 입력하고 검사를 시작하면 결과가 표시됩니다
                                    </>
                                )}
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                                {new Date().toLocaleDateString("ko-KR")} / 한국형 웹 콘텐츠
                                접근성 지침 2.2 기준
                            </p>
                            {displayScan?.status === "completed" &&
                                isDisplayingScanDetail && (
                                    <div className="flex flex-wrap items-center gap-4 mt-2">
                                        <div className="text-sm">
                      <span className="font-semibold text-green-600">
                        준수율: {displayScan.compliance_score?.toFixed(1)}%
                      </span>
                                        </div>
                                        <div className="text-sm">
                      <span className="font-semibold text-red-600">
                        총 이슈: {displayScan.total_issues}개
                      </span>
                                        </div>
                                    </div>
                                )}
                        </div>

                        <Button
                            onClick={() =>
                                generatePdf("reportContent", "accessibility-report.pdf")
                            }
                            disabled={!displayScan || displayScan.status !== "completed"}
                            className="flex-shrink-0"
                        >
                            PDF로 저장하기
                        </Button>
                    </div>

                    {/* 보고서 영역 */}
                    <div
                        className="p-6 overflow-hidden bg-white border rounded-lg"
                        id="reportContent"
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-center min-w-[600px]">
                                <thead>
                                <tr className="border-b">
                                    <th className="w-16 p-2">순번</th>
                                    <th className="p-2 text-left min-w-[100px]">항목</th>
                                    <th className="w-24 p-2">준수율</th>
                                    <th className="w-24 p-2">오류 확인</th>
                                </tr>
                                </thead>
                                <tbody>
                                {resultItems.map((item) => (
                                    <tr key={item.id} className="border-b">
                                        <td className="p-2">{item.id}</td>
                                        <td className="p-2 text-left">
                                            <span className="break-words">{item.name}</span>
                                        </td>
                                        <td className="p-2">
                                            <span className="break-words">{item.score}</span>
                                        </td>
                                        <td className="p-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className={`${
                                                    item.type === "진행중"
                                                        ? "bg-yellow-500 text-white"
                                                        : item.type === "대기"
                                                            ? "bg-gray-400 text-white"
                                                            : "bg-[#6C9AFF] text-white"
                                                } whitespace-nowrap`}
                                                disabled={
                                                    !displayScan ||
                                                    (displayScan.status !== "completed" &&
                                                        item.type !== "진행중") ||
                                                    item.type === "대기"
                                                }
                                                onClick={() => {
                                                    if (
                                                        displayScan &&
                                                        displayScan.status === "completed" &&
                                                        item.category
                                                    ) {
                                                        navigate(
                                                            `/scan/${displayScan.id}/${item.category}`
                                                        );
                                                    }
                                                }}
                                            >
                                                {item.type}
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* 설문 모달 - 항상 동일한 위치에 렌더링 */}
            <SurveyModal open={openSurvey} onClose={closeSurvey} />
        </>
    );
};

export default DashboardPage;