import { CATS } from "@/constants/accessibilityCats";
import { formatCompliance } from "@/utils/format";
import type { DetailRow } from "@/types/report";

export const PdfSummaryTable = ({
  selectedScanDetail,
}: {
  selectedScanDetail: any | null;
}) => {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b">
          <th className="w-20 p-3 text-left">순번</th>
          <th className="p-3 text-left">검사 항목</th>
          <th className="p-3 text-right w-36">준수율</th>
        </tr>
      </thead>
      <tbody>
        {CATS.map((cat) => {
          const all: DetailRow[] =
            (selectedScanDetail && selectedScanDetail[cat.prop]) || [];
          const pass = all.filter(cat.isPass).length;
          const total = all.length || 0;

          let display: string;
          if (cat.prop === "contrast_results") {
            display = "-"; // 명도 대비는 항상 하이픈
          } else if (total === 0) {
            display = "0/0"; // 검사 항목이 없는 경우
          } else {
            display = formatCompliance(pass, total);
          }

          return (
            <tr key={cat.id} className="border-b last:border-b-0">
              <td className="p-3">{cat.id}</td>
              <td className="p-3">{cat.title}</td>
              <td className="p-3 text-right">{display}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
