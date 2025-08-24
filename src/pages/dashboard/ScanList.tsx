import { Button } from "@/components/ui/button";
import { Loader2, ChevronRight, AlertCircle } from "lucide-react";
import { getStatusDisplay } from "@/utils/scanSataus";

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
      <div className="flex flex-col items-center justify-center py-8 text-gray-500">
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
        return (
          <Button
            key={scan.id}
            variant="outline"
            className={`justify-between w-full p-3 h-auto ${
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
        );
      })}
    </div>
  );
};
