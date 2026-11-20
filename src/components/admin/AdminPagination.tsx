import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

type AdminPaginationProps = {
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (nextPage: number) => void;
  disabled?: boolean;
};

export const AdminPagination = ({
  page,
  pageSize,
  totalCount,
  onPageChange,
  disabled = false,
}: AdminPaginationProps) => {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-200">
      <div className="text-sm text-gray-600">
        총 <span className="font-semibold text-gray-900">{totalCount.toLocaleString()}</span>건 ·{" "}
        <span className="font-medium text-gray-900">{page}</span> / {totalPages} 페이지
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || page <= 1}
          onClick={() => onPageChange(Math.max(1, page - 1))}
          className="gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          이전
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || page >= totalPages}
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          className="gap-1"
        >
          다음
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
