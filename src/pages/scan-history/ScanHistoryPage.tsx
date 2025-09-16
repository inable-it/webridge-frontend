import { useEffect, useMemo, useState, useId, useRef } from "react";
import {
  useGetScanListQuery,
  useDeleteScanMutation,
} from "@/features/api/scanApi";
import { Button } from "@/components/ui/button";
import { ExternalLink, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setActiveMenu } from "@/features/store/menuSlice";

function formatYMD(dateLike?: string | null) {
  if (!dateLike) return "-";
  const d = new Date(dateLike);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

export default function ScanHistoryPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useMemo(() => {
    dispatch(setActiveMenu("검사 이력"));
  }, [dispatch]);

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isFetching, refetch } = useGetScanListQuery({
    page,
    page_size: pageSize,
    ordering: "-created_at",
  });

  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [deleteScan] = useDeleteScanMutation();

  // 포커스 타깃
  const trashRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setSelected({});
  }, [page]);

  const allChecked = data?.results?.length
    ? data.results.every((r) => selected[r.id])
    : false;

  const toggleAll = () => {
    if (!data?.results) return;
    const next: Record<string, boolean> = {};
    if (!allChecked) {
      data.results.forEach((r) => (next[r.id] = true));
    }
    setSelected(next);
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const onDeleteSelected = async () => {
    const ids = Object.entries(selected)
      .filter(([, v]) => v)
      .map(([k]) => k);
    if (ids.length === 0) return;

    if (!confirm(`선택한 ${ids.length}건을 삭제할까요?`)) return;

    for (const id of ids) {
      try {
        await deleteScan(id).unwrap();
      } catch {
        alert("일부 항목 삭제 실패");
      }
    }
    await refetch();
    setSelected({});
  };

  const goDetail = (scanId: string, siteTitle?: string) => {
    navigate("/dashboard", { state: { scanId, siteTitle } });
  };

  const headerCheckId = useId();
  const count = data?.results?.length ?? 0;
  const hasAnySelected = Object.values(selected).some(Boolean);
  const totalPages = Math.max(1, Math.ceil((data?.count ?? 0) / pageSize));

  return (
    <div className="flex h-screen flex-col bg-[#ecf3ff] p-8 gap-5">
      <div className="p-6 bg-white shadow rounded-2xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-gray-900">검사 이력</h1>

            {/* 휴지통 (포커스 대상) */}
            <Button
                type="button"
                variant="outline"
                onClick={onDeleteSelected}
                disabled={isFetching || !hasAnySelected}
                className="p-2 border border-gray-950 text-gray-900 hover:bg-gray-100 disabled:border-gray-400 disabled:text-gray-400 transition"
                title="선택 삭제"
                aria-controls="scan-list"
                aria-label="선택 항목 삭제"
                ref={trashRef}
                onKeyDown={(e) => {
                    if (e.key === "Tab" && !e.shiftKey) {
                        const nextBtn = nextRef.current;
                        if (nextBtn && !nextBtn.disabled) {
                            e.preventDefault();
                            nextBtn.focus();
                        }
                    }
                }}
            >
                <Trash2 className="w-5 h-5" />
            </Button>

        </div>

        {/* 카드 리스트 */}
        <div
          id="scan-list"
          className="overflow-hidden bg-white border border-[#727272] rounded-xl"
        >
          {/* 헤더 행 */}
          <div className="grid items-center grid-cols-12 px-4 py-3 text-xs font-medium text-gray-700 border-b">
            <div className="col-span-1">
              <label
                htmlFor={headerCheckId}
                className="inline-flex items-center gap-2 cursor-pointer"
                title={
                  allChecked
                    ? "현재 페이지 항목 전체 선택 해제"
                    : "현재 페이지 항목 전체 선택"
                }
              >
                <input
                  id={headerCheckId}
                  type="checkbox"
                  checked={!!data?.results?.length && allChecked}
                  onChange={toggleAll}
                />
                <span className="sr-only">
                  {allChecked
                    ? "현재 페이지 항목 전체 선택 해제"
                    : "현재 페이지 항목 전체 선택"}
                </span>
              </label>
            </div>
            <div className="col-span-4 sm:col-span-4">사이트명</div>
            <div className="col-span-6 sm:col-span-6">주소</div>
            <div className="col-span-1 text-right">일자</div>
          </div>

          {/* 로딩/빈 상태/행 */}
          {isFetching && !data ? (
            <div className="p-6 text-sm text-gray-700">불러오는 중…</div>
          ) : count === 0 ? (
            <div className="p-6 text-sm text-gray-700">데이터가 없습니다.</div>
          ) : (
            data!.results.map((row, idx) => {
              const rowCheckId = `row-check-${row.id}`;
              const labelText = `${row.title || "사이트"} 선택`;
              const isLast = idx === count - 1;

              return (
                <div
                  key={row.id}
                  className="grid items-center grid-cols-12 px-4 py-3 text-sm border-t first:border-t-0 hover:bg-gray-50"
                >
                  {/* 체크박스 (탭 가능) */}
                  <div className="col-span-1">
                    <label
                      htmlFor={rowCheckId}
                      className="inline-flex items-center gap-2 cursor-pointer"
                      title={labelText}
                    >
                      <input
                        id={rowCheckId}
                        type="checkbox"
                        checked={!!selected[row.id]}
                        onChange={() => toggleOne(row.id)}
                        // 마지막 체크박스에서 Tab → 휴지통으로 강제 이동
                        onKeyDown={(e) => {
                          if (isLast && e.key === "Tab" && !e.shiftKey) {
                            const trashBtn = trashRef.current;
                            const nextBtn = nextRef.current;
                            if (trashBtn && !trashBtn.disabled) {
                              e.preventDefault();
                              trashBtn.focus();
                            } else if (nextBtn && !nextBtn.disabled) {
                              e.preventDefault();
                              nextBtn.focus();
                            }
                          }
                        }}
                      />
                      <span className="sr-only">{labelText}</span>
                    </label>
                  </div>

                  {/* 사이트명 — 탭에서 제외 */}
                  <div className="col-span-4">
                    <button
                      tabIndex={-1}
                      onClick={() => goDetail(row.id, row.title)}
                      className="font-medium text-blue-600 hover:underline"
                      title="상세 보기"
                    >
                      {row.title || "사이트"}
                    </button>
                  </div>

                  {/* 주소 — 탭에서 제외 */}
                  <div className="flex items-center col-span-6 gap-2 truncate">
                    <a
                      href={row.url}
                      target="_blank"
                      rel="noreferrer"
                      tabIndex={-1}
                      className="truncate hover:underline"
                      title={row.url}
                    >
                      {row.url}
                    </a>
                    <ExternalLink
                      className="w-4 h-4 text-gray-700 shrink-0"
                      aria-hidden="true"
                    />
                  </div>

                  <div className="col-span-1 text-right text-gray-700">
                    {formatYMD(
                      row.completed_at || row.updated_at || row.created_at
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 페이지네이션 */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-700">
            총 {(data?.count ?? 0).toLocaleString()}건 · {page}/{totalPages}
            페이지
          </div>
          <div className="flex items-center gap-2">
              <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || isFetching}
                  className="border border-gray-900 text-gray-900 hover:bg-gray-100"

                  tabIndex={-1} // 탭 순서에서 제외
              >
                  이전
              </Button>
              <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages || isFetching}
                  className="border border-gray-900 text-gray-900 hover:bg-gray-100"
                  ref={nextRef}
              >
                  다음
              </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
