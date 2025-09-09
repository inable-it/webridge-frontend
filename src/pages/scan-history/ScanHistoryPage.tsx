import { useEffect, useMemo, useState, useId } from "react";
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

  // LNB 하이라이트
  useMemo(() => {
    dispatch(setActiveMenu("검사 이력"));
  }, [dispatch]);

  // 페이징만 유지
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // 목록 가져오기
  const { data, isFetching, refetch } = useGetScanListQuery({
    page,
    page_size: pageSize,
    ordering: "-created_at",
  });

  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [deleteScan] = useDeleteScanMutation();

  useEffect(() => {
    // 페이지가 바뀔 때 선택 초기화
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

    // 순차 삭제 (실패는 알림)
    for (const id of ids) {
      try {
        await deleteScan(id).unwrap();
      } catch (e) {
        alert("일부 항목 삭제 실패");
      }
    }
    await refetch();
    setSelected({});
  };

  const goDetail = (scanId: string, siteTitle?: string) => {
    navigate("/dashboard", { state: { scanId, siteTitle } });
  };

  // 전체선택 체크박스 id (고유)
  const headerCheckId = useId();

  return (
    <div className="flex h-screen flex-col bg-[#ecf3ff] p-8 gap-5">
      <div className="p-6 bg-white shadow rounded-2xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-gray-900">검사 이력</h1>

          <Button
            type="button"
            variant="outline"
            onClick={onDeleteSelected}
            disabled={isFetching || !Object.values(selected).some(Boolean)}
            className="p-2 border border-[#727272]"
            title="선택 삭제"
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>

        {/* 카드 리스트 */}
        <div className="overflow-hidden bg-white border border-[#727272] rounded-xl">
          {/* 헤더 행 */}
          <div className="grid items-center grid-cols-12 px-4 py-3 text-xs font-medium text-gray-700 border-b">
            <div className="col-span-1">
              {/* 전체 선택 레이블 연결 */}
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
          ) : (data?.results?.length ?? 0) === 0 ? (
            <div className="p-6 text-sm text-gray-700">데이터가 없습니다.</div>
          ) : (
            data?.results.map((row) => {
              // 각 행 체크박스 id (고유)
              const rowCheckId = `row-check-${row.id}`;
              const labelText = `${row.title || "사이트"} 선택`;

              return (
                <div
                  key={row.id}
                  className="grid items-center grid-cols-12 px-4 py-3 text-sm border-t first:border-t-0 hover:bg-gray-50"
                >
                  {/* 체크박스 */}
                  <div className="col-span-1">
                    {/* 행 선택 레이블 연결 */}
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
                      />
                      <span className="sr-only">{labelText}</span>
                    </label>
                  </div>

                  {/* 사이트명 (링크 버튼) */}
                  <div className="col-span-4">
                    <button
                      onClick={() => goDetail(row.id, row.title)}
                      className="font-medium text-blue-600 hover:underline"
                      title="상세 보기"
                    >
                      {row.title || "사이트"}
                    </button>
                  </div>

                  {/* 주소 (새 창) */}
                  <div className="flex items-center col-span-6 gap-2 truncate">
                    <a
                      href={row.url}
                      target="_blank"
                      rel="noreferrer"
                      className="truncate hover:underline"
                      title={row.url}
                    >
                      {row.url}
                    </a>
                    <ExternalLink className="w-4 h-4 text-gray-700 shrink-0" />
                  </div>

                  {/* 일자 */}
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
            총 {(data?.count ?? 0).toLocaleString()}건 · {page}/
            {Math.max(1, Math.ceil((data?.count ?? 0) / pageSize))}페이지
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || isFetching}
              className="border border-[#727272]"
            >
              이전
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                setPage((p) =>
                  Math.min(
                    Math.max(1, Math.ceil((data?.count ?? 0) / pageSize)),
                    p + 1
                  )
                )
              }
              disabled={
                page >= Math.max(1, Math.ceil((data?.count ?? 0) / pageSize)) ||
                isFetching
              }
              className="border border-[#727272]"
            >
              다음
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
