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

  // 이전 완료 상태 및 완료된 스캔 수 추적
  const prevStatusRef = useRef<string | undefined>(selectedScanDetail?.status);
  const prevCompletedCountRef = useRef<number>(
    scanListData?.results?.filter((r) => r.status === "completed").length ?? 0
  );

  // 스캔이 완료되었을 때만 서버 신호 재확인 (진행 중일 때 반복 호출 방지)
  useEffect(() => {
    const currentStatus = selectedScanDetail?.status;
    const currentCompletedCount =
      scanListData?.results?.filter((r) => r.status === "completed").length ?? 0;

    const justCompleted =
      prevStatusRef.current !== "completed" && currentStatus === "completed";
    const newScanCompleted =
      currentCompletedCount > prevCompletedCountRef.current;

    prevStatusRef.current = currentStatus;
    prevCompletedCountRef.current = currentCompletedCount;

    if (justCompleted || newScanCompleted) {
      refetch();
    }
  }, [
    refetch,
    selectedScanDetail?.status,
    scanListData?.results,
  ]);

  // 서버 신호로는 "열기만" 하고, 자동으로 닫지 않는다.
  useEffect(() => {
    if (!data) return;

    // 이미 완료된 사용자면 열지 않음
    if (data.survey_completed) {
      // 여기서 굳이 열려있는 걸 강제로 닫지 않는다 (사용자 액션으로만 닫음)
      return;
    }
    // 서버가 표시하라면 열기. 반대로 "표시X" 라고 와도 닫지 않는다.
    if (data.should_show_survey) {
      setOpen(true);
    }
  }, [data]);

  // 열렸다면 서버에 “표시함” 기록 (한 번만)
  useEffect(() => {
    if (open && !markedRef.current) {
      markedRef.current = true;
      markShown().catch(() => {
        // 실패 무시
      });
    }
  }, [open, markShown]);

  // 서버 실패 시 폴백: “첫 완료 1회 노출”
  useEffect(() => {
    if (!isError || open) return;

    const s = selectedScanDetail;
    const isCurrentCompleted = (() => {
      if (!s) return false;
      if (s.status === "completed") return true;
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

    if (isCurrentCompleted && selectedScanDetail) {
      const seenKey = "webridge.survey.seenScanIds";
      let seen: string[] = [];
      try {
        seen = JSON.parse(localStorage.getItem(seenKey) || "[]");
      } catch {}
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
    // 닫기는 "반드시 사용자 액션"으로만
    closeSurvey: () => setOpen(false),
    // 완료 후 부모에서 refetch 등 처리할 때도, 닫기는 여기로
    onSurveyCompleted: () => setOpen(false),
  };
}
