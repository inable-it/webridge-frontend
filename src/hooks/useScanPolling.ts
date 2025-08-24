import { useEffect } from "react";

type Params = {
  progressingScanIds: string[];
  selectedScanId: string | null;
  selectedStatus?: string;
  refetchList: () => any;
  refetchDetail: () => any;
};

export const useScanPolling = ({
  progressingScanIds,
  selectedScanId,
  selectedStatus,
  refetchList,
  refetchDetail,
}: Params) => {
  useEffect(() => {
    let listTimer: number | null = null;
    if (progressingScanIds.length > 0) {
      listTimer = window.setInterval(() => {
        refetchList();
      }, 2000);
    }
    return () => {
      if (listTimer) window.clearInterval(listTimer);
    };
  }, [progressingScanIds, refetchList]);

  useEffect(() => {
    let detailTimer: number | null = null;
    if (
      selectedScanId &&
      (selectedStatus === "processing" || selectedStatus === "pending")
    ) {
      detailTimer = window.setInterval(() => {
        refetchDetail();
      }, 2000);
    }
    return () => {
      if (detailTimer) window.clearInterval(detailTimer);
    };
  }, [selectedScanId, selectedStatus, refetchDetail]);
};
