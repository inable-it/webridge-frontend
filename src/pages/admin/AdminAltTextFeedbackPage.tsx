import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  RefreshCw,
  ImageOff,
  MessageSquareHeart,
} from "lucide-react";
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
  useGetAdminAltTextFeedbacksQuery,
  type AdminAltTextFeedbackItem,
  type AdminAltTextFeedbackRating,
} from "@/features/api/adminApi";
import { AdminPagination } from "@/components/admin/AdminPagination";

const PAGE_SIZE = 20;

const resolveImageUrl = (imgUrl: string, scanUrl?: string) => {
  if (!imgUrl) return "";
  if (/^(https?:|data:|blob:)/i.test(imgUrl)) return imgUrl;
  if (scanUrl) {
    try {
      return new URL(imgUrl, scanUrl).href;
    } catch {
      return imgUrl;
    }
  }
  return imgUrl;
};

const RatingBadge = ({ rating }: { rating: AdminAltTextFeedbackRating }) => {
  if (rating === "like") {
    return (
      <Badge className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50 inline-flex items-center gap-1">
        <ThumbsUp className="w-3 h-3" />
        좋아요
      </Badge>
    );
  }
  return (
    <Badge className="bg-red-50 text-red-700 border-red-200 hover:bg-red-50 inline-flex items-center gap-1">
      <ThumbsDown className="w-3 h-3" />
      별로예요
    </Badge>
  );
};

const FeedbackImageThumb = ({
  src,
  alt,
  onClick,
}: {
  src: string;
  alt: string;
  onClick: () => void;
}) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <button
        type="button"
        onClick={onClick}
        title="상세 보기"
        className="w-16 h-16 rounded-md border border-gray-200 bg-gray-50 flex flex-col items-center justify-center text-gray-400 hover:border-gray-300 shrink-0"
      >
        <ImageOff className="w-4 h-4" />
        <span className="text-[10px] mt-0.5">로드 실패</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      title="이미지 크게 보기"
      className="w-16 h-16 rounded-md border border-gray-200 bg-gray-50 overflow-hidden hover:ring-2 hover:ring-blue-500 transition shrink-0"
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-contain"
        onError={() => setHasError(true)}
      />
    </button>
  );
};

const AdminAltTextFeedbackPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState<"all" | AdminAltTextFeedbackRating>("all");
  const [selectedItem, setSelectedItem] = useState<AdminAltTextFeedbackItem | null>(null);

  const { data, isLoading, isFetching, refetch } = useGetAdminAltTextFeedbacksQuery({
    page,
    size: PAGE_SIZE,
    rating: ratingFilter === "all" ? undefined : ratingFilter,
    search: search || undefined,
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const totalLikes = data?.total_likes ?? 0;
  const totalDislikes = data?.total_dislikes ?? 0;
  const totalCount = data?.count ?? 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">AI 대체텍스트 피드백</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            대체텍스트 검사 후 사용자가 AI 제안 결과에 남긴 좋아요/별로예요 평가를 확인합니다.
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="bg-white border-gray-200">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs font-medium text-gray-500">조회된 피드백</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {totalCount.toLocaleString()}건
              </p>
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 text-gray-600">
              <MessageSquareHeart className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs font-medium text-gray-500">전체 좋아요</p>
              <p className="mt-1 text-2xl font-bold text-blue-600">
                {totalLikes.toLocaleString()}건
              </p>
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 text-blue-600">
              <ThumbsUp className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs font-medium text-gray-500">전체 별로예요</p>
              <p className="mt-1 text-2xl font-bold text-red-600">
                {totalDislikes.toLocaleString()}건
              </p>
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-50 text-red-600">
              <ThumbsDown className="w-5 h-5" />
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
                placeholder="URL, 제목, 현재 대체텍스트, AI 제안값, 작성자 이메일로 검색..."
                className="pl-9 h-9"
              />
            </div>

            <select
              aria-label="평가 필터"
              value={ratingFilter}
              onChange={(e) => {
                setRatingFilter(e.target.value as "all" | AdminAltTextFeedbackRating);
                setPage(1);
              }}
              className="px-3 text-sm bg-white border border-gray-300 rounded-md h-9 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">평가: 전체</option>
              <option value="like">좋아요 (like)</option>
              <option value="dislike">별로예요 (dislike)</option>
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
              조건에 해당하는 AI 대체텍스트 피드백이 없습니다.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="text-xs text-gray-500 border-b border-gray-200 bg-gray-50">
                      <th className="px-3 py-2.5 font-medium">이미지</th>
                      <th className="px-3 py-2.5 font-medium">현재 입력된 대체텍스트</th>
                      <th className="px-3 py-2.5 font-medium">AI 대체텍스트 제안값</th>
                      <th className="px-3 py-2.5 font-medium text-center">평가</th>
                      <th className="px-3 py-2.5 font-medium">대상 사이트 / 작성자</th>
                      <th className="px-3 py-2.5 font-medium">등록 일시</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.results.map((item) => {
                      const resolvedImgUrl = resolveImageUrl(item.img_url, item.scan_url);
                      return (
                      <tr key={item.id} className="hover:bg-gray-50 align-top">
                        <td className="px-3 py-3">
                          <FeedbackImageThumb
                            src={resolvedImgUrl}
                            alt={item.alt_text || "검사 대상 이미지"}
                            onClick={() => setSelectedItem(item)}
                          />
                        </td>

                        <td className="px-3 py-3 max-w-[220px]">
                          {item.alt_text ? (
                            <p className="text-xs text-gray-800 break-words whitespace-pre-wrap">
                              {item.alt_text}
                            </p>
                          ) : (
                            <span className="inline-block px-2 py-0.5 text-xs text-gray-500 bg-gray-100 rounded">
                              (미입력)
                            </span>
                          )}
                        </td>

                        <td className="px-3 py-3 max-w-[300px]">
                          <p className="text-xs font-medium text-gray-900 break-words whitespace-pre-wrap">
                            {item.suggested_alt || "-"}
                          </p>
                          {item.ai_improvement &&
                            item.ai_improvement !== item.suggested_alt && (
                              <p className="mt-1 text-[11px] text-gray-500 break-words whitespace-pre-wrap">
                                {item.ai_improvement}
                              </p>
                            )}
                        </td>

                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          <RatingBadge rating={item.rating} />
                        </td>

                        <td className="px-3 py-3 max-w-[220px]">
                          <div className="text-xs font-medium text-gray-900 truncate">
                            {item.scan_title || "(제목 없음)"}
                          </div>
                          <a
                            href={item.scan_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline max-w-full truncate"
                          >
                            <span className="truncate">{item.scan_url}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                          <div className="mt-1 text-[11px] text-gray-500 truncate">
                            작성자: {item.user_email || "비회원"}
                          </div>
                          <Button
                            type="button"
                            variant="link"
                            size="sm"
                            className="h-auto p-0 mt-1 text-[11px] text-blue-600"
                            onClick={() =>
                              navigate(`/scan/${item.scan_id}/alt_text`)
                            }
                          >
                            리포트 바로가기 →
                          </Button>
                        </td>

                        <td className="px-3 py-3 text-xs text-gray-500 whitespace-nowrap">
                          {item.created_at
                            ? new Date(item.created_at).toLocaleString("ko-KR")
                            : "-"}
                        </td>
                      </tr>
                      );
                    })}
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

      {/* 상세 미리보기 모달 */}
      <Dialog
        open={selectedItem !== null}
        onOpenChange={(open) => !open && setSelectedItem(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              AI 대체텍스트 피드백 상세
              {selectedItem && <RatingBadge rating={selectedItem.rating} />}
            </DialogTitle>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-4 text-sm">
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex flex-col items-center gap-2">
                <img
                  src={resolveImageUrl(selectedItem.img_url, selectedItem.scan_url)}
                  alt={selectedItem.alt_text || "검사 대상 이미지"}
                  className="max-h-64 object-contain rounded"
                />
                <a
                  href={resolveImageUrl(selectedItem.img_url, selectedItem.scan_url)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline break-all"
                >
                  {resolveImageUrl(selectedItem.img_url, selectedItem.scan_url)}
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="p-3 rounded-lg border border-gray-200 bg-white">
                  <div className="text-xs font-medium text-gray-500 mb-1">
                    현재 입력된 대체텍스트
                  </div>
                  <div className="text-sm text-gray-900 break-words whitespace-pre-wrap">
                    {selectedItem.alt_text || "(미입력)"}
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-blue-200 bg-blue-50/40">
                  <div className="text-xs font-medium text-blue-700 mb-1">
                    AI 대체텍스트 제안값
                  </div>
                  <div className="text-sm font-medium text-gray-900 break-words whitespace-pre-wrap">
                    {selectedItem.suggested_alt || "-"}
                  </div>
                  {selectedItem.ai_improvement &&
                    selectedItem.ai_improvement !== selectedItem.suggested_alt && (
                      <p className="mt-1.5 text-xs text-gray-600 break-words whitespace-pre-wrap">
                        {selectedItem.ai_improvement}
                      </p>
                    )}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
                <span>작성자: {selectedItem.user_email || "비회원"}</span>
                <span>
                  {selectedItem.created_at
                    ? new Date(selectedItem.created_at).toLocaleString("ko-KR")
                    : "-"}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAltTextFeedbackPage;
