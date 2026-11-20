import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Loader2, Eye, Trash2, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useGetAdminScansQuery,
  useGetAdminScanDetailQuery,
  useDeleteAdminScanMutation,
  type AdminScanItem,
} from "@/features/api/adminApi";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { toast } from "@/hooks/use-toast";
import { CATS } from "@/constants/accessibilityCats";

const PAGE_SIZE = 20;

const ScanStatusBadge = ({ status }: { status?: string }) => {
  switch (status) {
    case "completed":
      return (
        <Badge className="text-green-700 bg-green-50 border-green-200">
          완료
        </Badge>
      );
    case "failed":
      return (
        <Badge className="text-red-700 bg-red-50 border-red-200">실패</Badge>
      );
    case "scanning":
    case "processing":
      return (
        <Badge className="text-blue-700 bg-blue-50 border-blue-200">
          진행중
        </Badge>
      );
    default:
      return (
        <Badge className="text-gray-700 bg-gray-100 border-gray-200">
          {status || "대기"}
        </Badge>
      );
  }
};

const ScanDetailModal = ({
  scanId,
  open,
  onOpenChange,
}: {
  scanId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useGetAdminScanDetailQuery(scanId!, {
    skip: !open || !scanId,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>검사 상세 리포트</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-gray-500">
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            검사 상세 정보를 불러오는 중...
          </div>
        ) : isError || !data ? (
          <div className="py-8 text-sm text-center text-red-600">
            검사 상세 정보를 불러오지 못했습니다.
          </div>
        ) : (
          <div className="space-y-4 text-sm">
            {/* 기본 요약 */}
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-base font-bold text-gray-900">
                    {data.title || "(제목 없음)"}
                  </div>
                  <a
                    href={data.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 mt-1 text-xs text-blue-600 hover:underline break-all"
                  >
                    {data.url}
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>
                <ScanStatusBadge status={data.status} />
              </div>

              <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-gray-200">
                <div>
                  <span className="text-xs text-gray-500">적합도 점수</span>
                  <div className="text-lg font-bold text-gray-900">
                    {typeof data.compliance_score === "number"
                      ? `${Math.round(data.compliance_score)}점`
                      : "-"}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-gray-500">총 오류 수</span>
                  <div className="text-lg font-bold text-red-600">
                    {data.total_issues ?? 0}개
                  </div>
                </div>
                <div>
                  <span className="text-xs text-gray-500">검사 일시</span>
                  <div className="text-xs font-medium text-gray-800 mt-1">
                    {data.created_at
                      ? new Date(data.created_at).toLocaleString("ko-KR")
                      : "-"}
                  </div>
                </div>
              </div>
            </div>

            {/* 13개 항목별 요약 결과 */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-gray-600 bg-gray-50 border-b border-gray-200">
                    <th className="px-3 py-2 font-medium">순번</th>
                    <th className="px-3 py-2 font-medium">검사 항목</th>
                    <th className="px-3 py-2 font-medium text-center">준수/전체</th>
                    <th className="px-3 py-2 font-medium text-center">상세 보기</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {CATS.map((cat) => {
                    const list = ((data as any)[cat.prop] as any[]) || [];
                    const passCount = list.filter((r) => cat.isPass(r)).length;
                    const categorySlug = cat.prop.replace(/_results$/, "");
                    return (
                      <tr key={cat.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-gray-500">{cat.id}</td>
                        <td className="px-3 py-2 font-medium text-gray-900">
                          {cat.title}
                        </td>
                        <td className="px-3 py-2 text-center font-medium">
                          {list.length > 0 ? `${passCount} / ${list.length}` : "-"}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-7 px-2.5 text-xs"
                            disabled={data.status !== "completed"}
                            onClick={() => {
                              onOpenChange(false);
                              navigate(`/scan/${data.id}/${categorySlug}`);
                            }}
                          >
                            리포트 열기
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

const AdminScansPage = () => {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [detailScanId, setDetailScanId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminScanItem | null>(null);

  const { data, isLoading, isFetching } = useGetAdminScansQuery({
    page,
    size: PAGE_SIZE,
    search: search || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const [deleteScan, { isLoading: isDeleting }] = useDeleteAdminScanMutation();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteScan(deleteTarget.id).unwrap();
      toast({
        title: "삭제 완료",
        description: "선택한 검사 기록이 삭제되었습니다.",
      });
      setDeleteTarget(null);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "삭제 실패",
        description:
          err?.data?.message || "검사 기록 삭제 중 오류가 발생했습니다.",
      });
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">검사 내역 관리</h2>
        <p className="mt-0.5 text-sm text-gray-500">
          전체 사용자가 실행한 웹 접근성 검사 이력을 조회하고 관리합니다.
        </p>
      </div>

      {/* 검색 및 필터 */}
      <Card className="bg-white border-gray-200">
        <CardContent className="p-4">
          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-wrap items-center gap-3"
          >
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="URL, 사이트 제목 또는 회원 이메일로 검색..."
                className="pl-9 h-9"
              />
            </div>

            <select
              aria-label="검사 상태 필터"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 text-sm bg-white border border-gray-300 rounded-md h-9 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">상태: 전체</option>
              <option value="completed">완료 (completed)</option>
              <option value="failed">실패 (failed)</option>
              <option value="scanning">진행중 (scanning)</option>
              <option value="pending">대기 (pending)</option>
            </select>

            <Button
              type="submit"
              size="sm"
              className="text-white bg-blue-600 h-9 hover:bg-blue-700"
            >
              검색
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* 검사 내역 테이블 */}
      <Card className="bg-white border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-gray-900">
            검사 기록 목록
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-gray-500">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              검사 내역을 불러오는 중...
            </div>
          ) : !data?.results?.length ? (
            <div className="py-16 text-sm text-center text-gray-500">
              조건에 해당하는 검사 기록이 없습니다.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="text-xs text-gray-500 border-b border-gray-200 bg-gray-50">
                      <th className="px-3 py-2.5 font-medium">검사 ID</th>
                      <th className="px-3 py-2.5 font-medium">사이트 제목 / 대상 URL</th>
                      <th className="px-3 py-2.5 font-medium text-right">점수</th>
                      <th className="px-3 py-2.5 font-medium text-right">오류 수</th>
                      <th className="px-3 py-2.5 font-medium text-center">상태</th>
                      <th className="px-3 py-2.5 font-medium">요청 회원</th>
                      <th className="px-3 py-2.5 font-medium">검사 일시</th>
                      <th className="px-3 py-2.5 font-medium text-center">관리</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.results.map((scan) => (
                      <tr key={scan.id} className="hover:bg-gray-50">
                        <td className="px-3 py-3 font-mono text-xs text-gray-500 max-w-[110px] truncate">
                          {scan.id}
                        </td>
                        <td className="px-3 py-3 max-w-[260px]">
                          <div className="font-medium text-gray-900 truncate">
                            {scan.title || "(제목 없음)"}
                          </div>
                          <a
                            href={scan.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-blue-600 truncate block hover:underline"
                          >
                            {scan.url}
                          </a>
                        </td>
                        <td className="px-3 py-3 text-right font-semibold text-gray-900">
                          {typeof scan.compliance_score === "number"
                            ? `${Math.round(scan.compliance_score)}점`
                            : "-"}
                        </td>
                        <td className="px-3 py-3 text-right text-gray-800">
                          {scan.total_issues ?? 0}개
                        </td>
                        <td className="px-3 py-3 text-center">
                          <ScanStatusBadge status={scan.status} />
                        </td>
                        <td className="px-3 py-3 text-xs text-gray-600 max-w-[160px] truncate">
                          {scan.user_email || scan.requester_email || "-"}
                        </td>
                        <td className="px-3 py-3 text-xs text-gray-500 whitespace-nowrap">
                          {scan.created_at
                            ? new Date(scan.created_at).toLocaleString("ko-KR")
                            : "-"}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-xs"
                              title="상세 보기"
                              onClick={() => setDetailScanId(scan.id)}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-xs text-red-600 hover:bg-red-50"
                              title="삭제"
                              onClick={() => setDeleteTarget(scan)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <AdminPagination
                page={page}
                pageSize={PAGE_SIZE}
                totalCount={data.count}
                onPageChange={setPage}
                disabled={isFetching}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* 상세 모달 */}
      <ScanDetailModal
        scanId={detailScanId}
        open={detailScanId !== null}
        onOpenChange={(open) => !open && setDetailScanId(null)}
      />

      {/* 삭제 확인 모달 */}
      <ConfirmModal
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="검사 기록 삭제"
        description={
          deleteTarget
            ? `"${deleteTarget.title || deleteTarget.url}" 검사 기록을 영구적으로 삭제하시겠습니까?`
            : ""
        }
        variant="destructive"
        confirmText="삭제"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default AdminScansPage;
