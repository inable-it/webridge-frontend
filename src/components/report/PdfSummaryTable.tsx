import { CATS } from "@/constants/accessibilityCats";
import { formatCompliance } from "@/utils/format";
import type { DetailRow } from "@/types/report";

export const PdfSummaryTable = ({
  selectedScanDetail,
}: {
  selectedScanDetail: any | null;
}) => {
  return (
    <div
      role="table"
      aria-label="웹 접근성 검사 요약 보고서"
      className="w-full min-w-0 text-sm"
    >
      <div role="rowgroup">
        <div role="row" className="grid grid-cols-[80px_1fr_120px] border-b">
          <div role="columnheader" className="p-3 text-left">
            순번
          </div>
          <div role="columnheader" className="p-3 text-left">
            검사 항목
          </div>
          <div role="columnheader" className="p-3 text-right">
            준수율
          </div>
        </div>
      </div>

      <div role="rowgroup">
        {CATS.map((cat) => {
          const all: DetailRow[] =
            (selectedScanDetail && selectedScanDetail[cat.prop]) || [];
          const pass = all.filter(cat.isPass).length;
          const total = all.length || 0;

          const display =
            cat.prop === "contrast_results"
              ? "-"
              : total === 0
              ? "0/0"
              : formatCompliance(pass, total);

          return (
            <div
              role="row"
              key={cat.id}
              className="grid grid-cols-[80px_1fr_120px] border-b last:border-b-0"
            >
              <div role="cell" className="p-3">
                {cat.id}
              </div>
              <div role="cell" className="p-3">
                {cat.title}
              </div>
              <div role="cell" className="p-3 text-right">
                {display}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
