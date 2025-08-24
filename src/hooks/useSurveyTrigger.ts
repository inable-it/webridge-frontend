import { useEffect, useRef, useState } from "react";

export const useSurveyTrigger = ({
  scanListData,
  selectedScanDetail,
}: {
  scanListData: any;
  selectedScanDetail: any;
}) => {
  const [openSurvey, setOpenSurvey] = useState(false);
  const hasChecked = useRef(false);

  useEffect(() => {
    if (hasChecked.current) return;
    if (!scanListData?.results || !selectedScanDetail) return;

    const hasResults = scanListData.results.length > 0;
    const isCompletedOrFailed = ["completed", "failed"].includes(
      selectedScanDetail.status
    );

    const allCompleted = Boolean(
      selectedScanDetail.alt_text_completed &&
        selectedScanDetail.video_completed &&
        selectedScanDetail.table_completed &&
        selectedScanDetail.contrast_completed &&
        selectedScanDetail.keyboard_completed &&
        selectedScanDetail.label_completed &&
        selectedScanDetail.markup_error_completed &&
        selectedScanDetail.basic_language_completed &&
        selectedScanDetail.heading_completed &&
        selectedScanDetail.response_time_completed &&
        selectedScanDetail.pause_control_completed &&
        selectedScanDetail.flashing_completed
    );

    if (hasResults && isCompletedOrFailed && allCompleted) {
      setOpenSurvey(true);
      hasChecked.current = true;
    }
  }, [scanListData, selectedScanDetail]);

  return { openSurvey, closeSurvey: () => setOpenSurvey(false) } as const;
};
