import { useState } from "react";
import {
  Search,
  Loader2,
  Star,
  Trash2,
  RefreshCw,
  MessageSquare,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  useGetAdminFeedbacksQuery,
  useDeleteAdminFeedbackMutation,
  type AdminFeedbackItem,
} from "@/features/api/adminApi";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { toast } from "@/hooks/use-toast";

const PAGE_SIZE = 20;

const StarRatingDisplay = ({ rating }: { rating: number }) => {
  const safeRating = Math.max(0, Math.min(5, Math.round(rating || 0)));
  return (
    <div className="inline-flex items-center gap-1" title={`${safeRating}점`}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3.5 h-3.5 ${
              star <= safeRating
                ? "fill-amber-400 text-amber-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
      <span className="ml-1 text-xs font-semibold text-gray-800">
        {rating}점
      </span>
    </div>
  );
};

const AdminFeedbackPage = () => {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [deleteTarget, setDeleteTarget] = useState<AdminFeedbackItem | null>(null);

  const { data, isLoading, isFetching, refetch } = useGetAdminFeedbacksQuery({
    page,
    size: PAGE_SIZE,
    rating: ratingFilter === "all" ? undefined : Number(ratingFilter),
    search: search || undefined,
  });

  const [deleteFeedback, { isLoading: isDeleting }] =
    useDeleteAdminFeedbackMutation();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteFeedback(deleteTarget.id).unwrap();
      toast({
        title: "삭제 완료",
        description: "선택한 서비스 피드백이 삭제되었습니다.",
      });
      setDeleteTarget(null);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "삭제 실패",
        description:
          err?.data?.message || "피드백 삭제 중 오류가 발생했습니다.",
      });
    }
  };

  const totalCount = data?.count ?? 0;
  const averageRating =
    typeof data?.average_rating === "number" ? data.average_rating : 0;
  const ratingCounts = data?.rating_counts ?? {};

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">서비스 이용 피드백</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            사용자가 [피드백] 탭에서 남긴 별점(1~5점)과 사용 후기를 조회하고 관리합니다.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="h-9 gap-1.5"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
          새로고침
        </Button>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="bg-white border-gray-200">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs font-medium text-gray-500">조회된 피드백</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {totalCount.toLocaleString()}건
              </p>
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 text-blue-600">
              <MessageSquare className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs font-medium text-gray-500">평균 별점</p>
              <p className="mt-1 text-2xl font-bold text-amber-600">
                {averageRating.toFixed(1)} <span className="text-sm font-medium text-gray-400">/ 5.0</span>
              </p>
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-50 text-amber-500">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-gray-500 mb-2">별점 분포</p>
            <div className="flex flex-wrap items-center gap-2">
              {["5", "4", "3", "2", "1"].map((score) => (
                <div
                  key={score}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-gray-50 border border-gray-200"
                >
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="font-medium text-gray-700">{score}점</span>
                  <span className="font-bold text-gray-900">
                    {(ratingCounts[score] ?? 0).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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
                placeholder="의견 내용, 작성자 이름 또는 이메일로 검색..."
                className="pl-9 h-9"
              />
            </div>

            <select
              aria-label="별점 필터"
              value={ratingFilter}
              onChange={(e) => {
                setRatingFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 text-sm bg-white border border-gray-300 rounded-md h-9 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">별점: 전체</option>
              <option value="5">5점</option>
              <option value="4">4점</option>
              <option value="3">3점</option>
              <option value="2">2점</option>
              <option value="1">1점</option>
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

      {/* 피드백 목록 테이블 */}
      <Card className="bg-white border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-gray-900">
            피드백 목록
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-gray-500">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              피드백 목록을 불러오는 중...
            </div>
          ) : !data?.results?.length ? (
            <div className="py-16 text-sm text-center text-gray-500">
              조건에 해당하는 서비스 피드백이 없습니다.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="text-xs text-gray-500 border-b border-gray-200 bg-gray-50">
                      <th className="px-3 py-2.5 font-medium">ID</th>
                      <th className="px-3 py-2.5 font-medium">별점</th>
                      <th className="px-3 py-2.5 font-medium">의견 내용</th>
                      <th className="px-3 py-2.5 font-medium">작성자</th>
                      <th className="px-3 py-2.5 font-medium">작성 일시</th>
                      <th className="px-3 py-2.5 font-medium text-center">관리</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.results.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 align-top">
                        <td className="px-3 py-3 text-xs text-gray-500 font-mono whitespace-nowrap">
                          #{item.id}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <StarRatingDisplay rating={item.rating} />
                        </td>
                        <td className="px-3 py-3 max-w-[420px]">
                          <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">
                            {item.content || "-"}
                          </p>
                        </td>
                        <td className="px-3 py-3 max-w-[200px]">
                          <div className="text-xs font-medium text-gray-900 truncate">
                            {item.user_name || "(이름 없음)"}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {item.user_email || "-"}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-xs text-gray-500 whitespace-nowrap">
                          <div>
                            {item.created_at
                              ? new Date(item.created_at).toLocaleString("ko-KR")
                              : "-"}
                          </div>
                          {item.updated_at &&
                            item.updated_at !== item.created_at &&
                            !Number.isNaN(new Date(item.updated_at).getTime()) && (
                              <div className="mt-0.5 text-[11px] text-gray-400">
                                수정:{" "}
                                {new Date(item.updated_at).toLocaleString("ko-KR")}
                              </div>
                            )}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-xs text-red-600 hover:bg-red-50"
                            title="삭제"
                            onClick={() => setDeleteTarget(item)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
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

      {/* 삭제 확인 모달 */}
      <ConfirmModal
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="서비스 피드백 삭제"
        description={
          deleteTarget
            ? `${deleteTarget.user_name || deleteTarget.user_email}님의 피드백(#${deleteTarget.id})을 영구적으로 삭제하시겠습니까?`
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

export default AdminFeedbackPage;
