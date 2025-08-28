import { Button } from "@/components/ui/button";
import { Loader2, ChevronRight, AlertCircle } from "lucide-react";
import { getStatusDisplay } from "@/utils/scanStatus";

type Scan = any; // TODO: API 타입으로 교체

export const ScanList = ({
  isLoading,
  scanList,
  selectedScanId,
  onSelect,
}: {
  isLoading: boolean;
  scanList: Scan[];
  selectedScanId: string | null;
  onSelect: (id: string) => void;
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (!scanList?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-700">
        <AlertCircle className="w-8 h-8 mb-2" />
        <p className="text-sm">검사 내역이 없습니다</p>
        <p className="text-xs">URL을 입력하여 검사를 시작해보세요</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {scanList.map((scan) => {
        const status = getStatusDisplay(scan);
        const isWorking =
          scan.status === "processing" || scan.status === "pending";
        const pct = Math.round(scan.completion_percentage || 0);

        return (
          <Button
            key={scan.id}
            variant="outline"
            className={`relative justify-between w-full p-3 h-auto ${
              selectedScanId === scan.id ? "bg-blue-50 border-blue-300" : ""
            }`}
            onClick={() => onSelect(scan.id)}
          >
            <div className="flex flex-col items-start text-left">
              <span className="text-sm truncate max-w-[200px]">
                {scan.title || scan.url}
              </span>

              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs ${status.color}`}>{status.text}</span>

                {scan.status === "completed" && (
                  <span className="text-xs text-gray-700">
                    {scan.total_issues}개 이슈
                  </span>
                )}
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-gray-600" />

            {/* 진행률 바: 버튼 하단에 가로 꽉 채우기 */}
            {isWorking && (
              <div
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={pct}
                className="absolute inset-x-0 bottom-0 h-1 bg-gray-200"
              >
                <div
                  className="h-full bg-blue-600 transition-[width] duration-500 ease-out"
                  style={{ width: `${pct}%` }}
                />
              </div>
            )}
          </Button>
        );
      })}
    </div>
  );
};
