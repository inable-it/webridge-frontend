import { useEffect, useRef, useState } from "react";
import type {
  AccessibilityScanDetail,
  ScanListResponse,
} from "@/features/api/scanApi";
import {
  useGetSurveyTriggerQuery,
  useMarkSurveyShownMutation,
} from "@/features/api/surveyApi";

type Args = {
  scanListData?: ScanListResponse;
  selectedScanDetail?: AccessibilityScanDetail | null;
};

export function useSurveyTrigger({ scanListData, selectedScanDetail }: Args) {
  const [open, setOpen] = useState(false);

  // 서버 신호 조회 (항상 호출)
  const { data, isError, refetch } = useGetSurveyTriggerQuery();
  const [markShown] = useMarkSurveyShownMutation();

  // 중복 호출 방지
  const markedRef = useRef(false);

  // 스캔 상태가 바뀌면 서버 신호 재확인
  useEffect(() => {
    refetch();
  }, [
    refetch,
    // 완료/대기 건수 변화에도 재확인
    scanListData?.results?.length,
    scanListData?.results?.map((r) => r.status).join(","),
    // 현재 상세의 상태 변화에도 재확인
    selectedScanDetail?.status,
    selectedScanDetail?.updated_at,
  ]);

  // 1) 서버 우선 로직
  useEffect(() => {
    if (!data) return;

    // 서버가 “표시해야 한다”면 열기 (완료 여부와 무관)
    const shouldOpen = data.should_show_survey && !data.survey_completed;
    setOpen(shouldOpen);
  }, [data]);

  // 2) 열렸다면 서버에 “표시함” 기록 (한 번만)
  useEffect(() => {
    if (open && !markedRef.current) {
      markedRef.current = true;
      markShown().catch(() => {
        // 표시함 기록 실패는 무시 (다음 틱에서 다시 서버가 막아줄 것)
      });
    }
  }, [open, markShown]);

  // 3) 서버 실패 시 폴백: “첫 완료 1회 노출” (기존 로직 유지)
  useEffect(() => {
    if (!isError || open) return;

    const s = selectedScanDetail;
    const isCurrentCompleted = (() => {
      if (!s) return false;
      if (s.status === "completed") return true;
      // 모든 완료 플래그(비디오 분리 포함)
      const completedFlags: (keyof AccessibilityScanDetail)[] = [
        "alt_text_completed",
        "contrast_completed",
        "keyboard_completed",
        "label_completed",
        "table_completed",
        "video_caption_completed" as any,
        "video_autoplay_completed" as any,
        "basic_language_completed",
        "markup_error_completed",
        "heading_completed",
        "response_time_completed",
        "pause_control_completed",
        "flashing_completed",
      ];
      return completedFlags.every((k) => Boolean((s as any)[k]));
    })();

    // 선택 상세가 막 완료되었고 아직 안 보여줬다면 열기
    if (isCurrentCompleted && selectedScanDetail) {
      const seenKey = "webridge.survey.seenScanIds";
      let seen: string[] = [];
      try {
        seen = JSON.parse(localStorage.getItem(seenKey) || "[]");
      } catch {
        seen = [];
      }
      if (!seen.includes(selectedScanDetail.id)) {
        setOpen(true);
        try {
          localStorage.setItem(
            seenKey,
            JSON.stringify([...new Set([...seen, selectedScanDetail.id])])
          );
        } catch {}
      }
    } else {
      // 누적 완료 1건 이상 시 한 번 노출
      const results = scanListData?.results ?? [];
      const doneCount = results.filter((r) => r.status === "completed").length;
      const threshold = 1;
      const shownKey = "webridge.survey.promptShownForCount";
      const lastShownFor = Number(localStorage.getItem(shownKey) || "0");
      if (doneCount >= threshold && lastShownFor < threshold) {
        setOpen(true);
        localStorage.setItem(shownKey, String(threshold));
      }
    }
  }, [isError, open, scanListData?.results, selectedScanDetail]);

  return {
    openSurvey: open,
    closeSurvey: () => setOpen(false),
  };
}
