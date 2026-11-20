import { useState } from "react";
import {
  Search,
  Loader2,
  Eye,
  Shield,
  ShieldOff,
  UserCheck,
  UserX,
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
  useGetAdminUsersQuery,
  useGetAdminUserDetailQuery,
  useUpdateAdminUserStatusMutation,
  useUpdateAdminUserRoleMutation,
  type AdminUserItem,
} from "@/features/api/adminApi";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { toast } from "@/hooks/use-toast";

const PAGE_SIZE = 20;

const UserDetailModal = ({
  userId,
  open,
  onOpenChange,
}: {
  userId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { data, isLoading, isError } = useGetAdminUserDetailQuery(userId!, {
    skip: !open || userId == null,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>회원 상세 정보</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-gray-500">
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            회원 정보를 불러오는 중...
          </div>
        ) : isError || !data ? (
          <div className="py-8 text-sm text-center text-red-600">
            회원 상세 정보를 불러오지 못했습니다.
          </div>
        ) : (
          <div className="space-y-5 text-sm">
            {/* 기본 정보 */}
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <h4 className="mb-3 text-xs font-bold text-gray-500 uppercase">
                기본 정보
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-xs text-gray-500">회원 ID</span>
                  <div className="font-medium text-gray-900">#{data.id}</div>
                </div>
                <div>
                  <span className="text-xs text-gray-500">이름</span>
                  <div className="font-medium text-gray-900">{data.name || "-"}</div>
                </div>
                <div>
                  <span className="text-xs text-gray-500">이메일</span>
                  <div className="font-medium text-gray-900 break-all">{data.email}</div>
                </div>
                <div>
                  <span className="text-xs text-gray-500">가입 방식</span>
                  <div className="font-medium text-gray-900">{data.provider}</div>
                </div>
                <div>
                  <span className="text-xs text-gray-500">상태 / 권한</span>
                  <div className="flex gap-1.5 mt-0.5">
                    <Badge
                      className={
                        data.is_active
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      }
                    >
                      {data.is_active ? "활성" : "정지"}
                    </Badge>
                    <Badge
                      className={
                        data.is_admin
                          ? "bg-purple-50 text-purple-700 border-purple-200"
                          : "bg-gray-100 text-gray-700 border-gray-200"
                      }
                    >
                      {data.is_admin ? "관리자" : "일반"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-gray-500">가입일</span>
                  <div className="font-medium text-gray-900">
                    {new Date(data.created_at).toLocaleString("ko-KR")}
                  </div>
                </div>
              </div>
            </div>

            {/* 가입 설문 */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="mb-2 text-xs font-bold text-gray-500 uppercase">
                가입 설문 정보
              </h4>
              {data.extra_info ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-gray-500">유입 경로</span>
                    <div className="font-medium text-gray-900">
                      {data.extra_info.path_to_webridge_label ||
                        data.extra_info.path_to_webridge ||
                        "-"}
                      {data.extra_info.path_to_webridge_other
                        ? ` (${data.extra_info.path_to_webridge_other})`
                        : ""}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">직군</span>
                    <div className="font-medium text-gray-900">
                      {data.extra_info.occupation_label ||
                        data.extra_info.occupation ||
                        "-"}
                      {data.extra_info.occupation_other
                        ? ` (${data.extra_info.occupation_other})`
                        : ""}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-500">등록된 가입 설문 정보가 없습니다.</p>
              )}
            </div>

            {/* 약관 동의 내역 */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="mb-2 text-xs font-bold text-gray-500 uppercase">
                약관 동의 내역
              </h4>
              {data.terms_agreements && data.terms_agreements.length > 0 ? (
                <div className="space-y-1.5">
                  {data.terms_agreements.map((t, idx) => (
                    <div
                      key={`${t.type}-${idx}`}
                      className="flex items-center justify-between py-1 text-xs border-b border-gray-100 last:border-b-0"
                    >
                      <span className="font-medium text-gray-800">
                        {t.type} {t.version ? `(v${t.version})` : ""}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={
                            t.agreed
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-gray-100 text-gray-600 border-gray-200"
                          }
                        >
                          {t.agreed ? "동의" : "미동의"}
                        </Badge>
                        {t.agreed_at && (
                          <span className="text-gray-400">
                            {new Date(t.agreed_at).toLocaleDateString("ko-KR")}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500">약관 동의 내역이 없습니다.</p>
              )}
            </div>

            {/* 최근 검사 내역 */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="mb-2 text-xs font-bold text-gray-500 uppercase">
                최근 검사 내역
              </h4>
              {data.recent_scans && data.recent_scans.length > 0 ? (
                <div className="space-y-2">
                  {data.recent_scans.map((scan) => (
                    <div
                      key={scan.id}
                      className="flex items-center justify-between p-2 text-xs rounded bg-gray-50"
                    >
                      <div className="min-w-0 pr-3">
                        <div className="font-medium text-gray-900 truncate">
                          {scan.title || "(제목 없음)"}
                        </div>
                        <div className="text-gray-500 truncate">{scan.url}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-semibold text-gray-900">
                          {Math.round(scan.compliance_score)}점 ({scan.status})
                        </div>
                        <div className="text-gray-400">
                          {new Date(scan.created_at).toLocaleDateString("ko-KR")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500">최근 검사 내역이 없습니다.</p>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

const AdminUsersPage = () => {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [isAdminFilter, setIsAdminFilter] = useState<string>("all");
  const [isActiveFilter, setIsActiveFilter] = useState<string>("all");
  const [providerFilter, setProviderFilter] = useState<string>("all");

  const [detailUserId, setDetailUserId] = useState<number | null>(null);
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    type: "status" | "role";
    user: AdminUserItem | null;
    nextValue: boolean;
  }>({
    open: false,
    type: "status",
    user: null,
    nextValue: false,
  });

  const { data, isLoading, isFetching } = useGetAdminUsersQuery({
    page,
    size: PAGE_SIZE,
    search: search || undefined,
    isAdmin: isAdminFilter === "all" ? undefined : isAdminFilter === "true",
    isActive: isActiveFilter === "all" ? undefined : isActiveFilter === "true",
    provider: providerFilter === "all" ? undefined : providerFilter,
  });

  const [updateStatus, { isLoading: isUpdatingStatus }] =
    useUpdateAdminUserStatusMutation();
  const [updateRole, { isLoading: isUpdatingRole }] =
    useUpdateAdminUserRoleMutation();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleConfirmAction = async () => {
    const { type, user, nextValue } = confirmState;
    if (!user) return;

    try {
      if (type === "status") {
        await updateStatus({ userId: user.id, is_active: nextValue }).unwrap();
        toast({
          title: "상태 변경 완료",
          description: `${user.email} 계정을 ${
            nextValue ? "활성화" : "정지"
          }했습니다.`,
        });
      } else {
        await updateRole({ userId: user.id, is_admin: nextValue }).unwrap();
        toast({
          title: "권한 변경 완료",
          description: `${user.email} 계정의 관리자 권한을 ${
            nextValue ? "부여" : "해제"
          }했습니다.`,
        });
      }
      setConfirmState((prev) => ({ ...prev, open: false }));
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "처리 실패",
        description:
          err?.data?.message || "요청을 처리하는 중 오류가 발생했습니다.",
      });
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">회원 관리</h2>
        <p className="mt-0.5 text-sm text-gray-500">
          전체 회원 목록 조회, 상세 정보 확인 및 상태/권한을 관리합니다.
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
                placeholder="이메일 또는 이름으로 검색..."
                className="pl-9 h-9"
              />
            </div>

            <select
              aria-label="활성 상태 필터"
              value={isActiveFilter}
              onChange={(e) => {
                setIsActiveFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 text-sm bg-white border border-gray-300 rounded-md h-9 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">상태: 전체</option>
              <option value="true">활성</option>
              <option value="false">정지</option>
            </select>

            <select
              aria-label="권한 필터"
              value={isAdminFilter}
              onChange={(e) => {
                setIsAdminFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 text-sm bg-white border border-gray-300 rounded-md h-9 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">권한: 전체</option>
              <option value="true">관리자</option>
              <option value="false">일반 회원</option>
            </select>

            <select
              aria-label="가입방식 필터"
              value={providerFilter}
              onChange={(e) => {
                setProviderFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 text-sm bg-white border border-gray-300 rounded-md h-9 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">가입방식: 전체</option>
              <option value="email">이메일</option>
              <option value="google">Google</option>
            </select>

            <Button type="submit" size="sm" className="h-9 bg-blue-600 hover:bg-blue-700 text-white">
              검색
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* 회원 목록 테이블 */}
      <Card className="bg-white border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-gray-900">
            회원 목록
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-gray-500">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              회원 목록을 불러오는 중...
            </div>
          ) : !data?.results?.length ? (
            <div className="py-16 text-sm text-center text-gray-500">
              조건에 해당하는 회원이 없습니다.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="text-xs text-gray-500 border-b border-gray-200 bg-gray-50">
                      <th className="px-3 py-2.5 font-medium">ID</th>
                      <th className="px-3 py-2.5 font-medium">이메일</th>
                      <th className="px-3 py-2.5 font-medium">이름</th>
                      <th className="px-3 py-2.5 font-medium text-center">가입방식</th>
                      <th className="px-3 py-2.5 font-medium text-center">상태</th>
                      <th className="px-3 py-2.5 font-medium text-center">권한</th>
                      <th className="px-3 py-2.5 font-medium">유입경로</th>
                      <th className="px-3 py-2.5 font-medium">직군</th>
                      <th className="px-3 py-2.5 font-medium text-right">검사</th>
                      <th className="px-3 py-2.5 font-medium">가입일</th>
                      <th className="px-3 py-2.5 font-medium text-center">관리</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.results.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-3 py-3 text-gray-500">{u.id}</td>
                        <td className="px-3 py-3 font-medium text-gray-900">
                          {u.email}
                        </td>
                        <td className="px-3 py-3 text-gray-800">{u.name || "-"}</td>
                        <td className="px-3 py-3 text-center">
                          <Badge variant="outline" className="text-xs">
                            {u.provider}
                          </Badge>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <Badge
                            className={
                              u.is_active
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-red-50 text-red-700 border-red-200"
                            }
                          >
                            {u.is_active ? "활성" : "정지"}
                          </Badge>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <Badge
                            className={
                              u.is_admin
                                ? "bg-purple-50 text-purple-700 border-purple-200"
                                : "bg-gray-100 text-gray-700 border-gray-200"
                            }
                          >
                            {u.is_admin ? "관리자" : "일반"}
                          </Badge>
                        </td>
                        <td className="px-3 py-3 text-xs text-gray-600">
                          {u.path_to_webridge_label || "-"}
                        </td>
                        <td className="px-3 py-3 text-xs text-gray-600">
                          {u.occupation_label || "-"}
                        </td>
                        <td className="px-3 py-3 text-right font-medium text-gray-900">
                          {u.scan_count ?? 0}회
                        </td>
                        <td className="px-3 py-3 text-xs text-gray-500 whitespace-nowrap">
                          {u.created_at
                            ? new Date(u.created_at).toLocaleDateString("ko-KR")
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
                              onClick={() => setDetailUserId(u.id)}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className={`h-7 px-2 text-xs ${
                                u.is_active
                                  ? "text-red-600 hover:bg-red-50"
                                  : "text-green-600 hover:bg-green-50"
                              }`}
                              title={u.is_active ? "회원 정지" : "회원 활성화"}
                              onClick={() =>
                                setConfirmState({
                                  open: true,
                                  type: "status",
                                  user: u,
                                  nextValue: !u.is_active,
                                })
                              }
                            >
                              {u.is_active ? (
                                <UserX className="w-3.5 h-3.5" />
                              ) : (
                                <UserCheck className="w-3.5 h-3.5" />
                              )}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-xs text-purple-700 hover:bg-purple-50"
                              title={u.is_admin ? "관리자 해제" : "관리자 부여"}
                              onClick={() =>
                                setConfirmState({
                                  open: true,
                                  type: "role",
                                  user: u,
                                  nextValue: !u.is_admin,
                                })
                              }
                            >
                              {u.is_admin ? (
                                <ShieldOff className="w-3.5 h-3.5" />
                              ) : (
                                <Shield className="w-3.5 h-3.5" />
                              )}
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

      {/* 회원 상세 모달 */}
      <UserDetailModal
        userId={detailUserId}
        open={detailUserId !== null}
        onOpenChange={(open) => !open && setDetailUserId(null)}
      />

      {/* 상태 / 권한 변경 확인 모달 */}
      <ConfirmModal
        open={confirmState.open}
        onOpenChange={(open) => setConfirmState((prev) => ({ ...prev, open }))}
        title={
          confirmState.type === "status"
            ? confirmState.nextValue
              ? "회원 활성화"
              : "회원 정지"
            : confirmState.nextValue
            ? "관리자 권한 부여"
            : "관리자 권한 해제"
        }
        description={
          confirmState.user
            ? `${confirmState.user.email} 계정을 ${
                confirmState.type === "status"
                  ? confirmState.nextValue
                    ? "활성 상태로 변경"
                    : "정지 처리"
                  : confirmState.nextValue
                  ? "관리자 권한으로 승격"
                  : "일반 회원 권한으로 해제"
              }하시겠습니까?`
            : ""
        }
        variant={
          confirmState.type === "status" && !confirmState.nextValue
            ? "destructive"
            : "default"
        }
        confirmText="변경"
        isLoading={isUpdatingStatus || isUpdatingRole}
        onConfirm={handleConfirmAction}
      />
    </div>
  );
};

export default AdminUsersPage;
