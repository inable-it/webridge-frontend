import { useEffect, useMemo, useState } from "react";
import { useGetScanDetailQuery } from "@/features/api/scanApi";

export const useScanSelection = (scanListData: any) => {
  const [selectedScanId, setSelectedScanId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedScanId && scanListData?.results?.length) {
      setSelectedScanId(scanListData.results[0].id);
    }
  }, [scanListData, selectedScanId]);

  const { data: selectedScanDetail, refetch: refetchDetail } =
    useGetScanDetailQuery(selectedScanId!, { skip: !selectedScanId });

  const progressingScanIds: string[] = useMemo(() => {
    if (!scanListData?.results) return [];
    return scanListData.results
      .filter((s: any) => s.status === "processing" || s.status === "pending")
      .map((s: any) => s.id);
  }, [scanListData]);

  const displayScan = useMemo(() => {
    if (selectedScanDetail) return selectedScanDetail;
    return scanListData?.results?.[0] ?? null;
  }, [selectedScanDetail, scanListData]);

  const selectedStatus = selectedScanDetail?.status as string | undefined;
  const isDisplayingScanDetail = Boolean(selectedScanDetail);

  return {
    selectedScanId,
    setSelectedScanId,
    displayScan,
    isDisplayingScanDetail,
    selectedScanDetail,
    selectedStatus,
    progressingScanIds,
    refetchDetail,
  } as const;
};
