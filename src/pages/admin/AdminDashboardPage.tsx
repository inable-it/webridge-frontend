import { Link } from "react-router-dom";
import {
  Users,
  UserPlus,
  ScanSearch,
  CheckCircle2,
  Award,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetAdminDashboardQuery, type DailyCount } from "@/features/api/adminApi";

const formatShortDate = (dateStr: string) => {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  return parts.length === 3 ? `${parts[1]}/${parts[2]}` : dateStr;
};

const StatusBadge = ({ status }: { status?: string }) => {
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
    case "processing":
    case "scanning":
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

const DailyBarChart = ({
  title,
  data,
  barColorClass,
}: {
  title: string;
  data: DailyCount[];
  barColorClass: string;
}) => {
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <Card className="bg-white border-gray-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-gray-900">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="py-10 text-sm text-center text-gray-400">
            데이터가 없습니다.
          </div>
        ) : (
          <div className="flex items-end justify-between h-44 gap-2 pt-6">
            {data.map((item) => {
              const heightPct = Math.max(6, Math.round((item.count / max) * 100));
              return (
                <div
                  key={item.date}
                  className="flex flex-col items-center flex-1 h-full justify-end gap-1.5"
                >
                  <span className="text-xs font-semibold text-gray-700">
                    {item.count}
                  </span>
                  <div className="flex items-end w-full max-w-[36px] h-28 bg-gray-100 rounded-t-md overflow-hidden">
                    <div
                      className={`w-full rounded-t-md transition-all duration-300 ${barColorClass}`}
                      style={{ height: `${heightPct}%` }}
                      title={`${item.date}: ${item.count}건`}
                    />
                  </div>
                  <span className="text-[11px] text-gray-500">
                    {formatShortDate(item.date)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const AdminDashboardPage = () => {
  const { data, isLoading, isError, refetch, isFetching } =
    useGetAdminDashboardQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-500">
        <Loader2 className="w-6 h-6 mr-2 animate-spin" />
        대시보드 데이터를 불러오는 중...
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="w-10 h-10 mb-3 text-red-500" />
        <p className="mb-4 text-sm text-gray-600">
          대시보드 데이터를 불러오지 못했습니다.
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          다시 시도
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 상단 타이틀 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">관리자 대시보드</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            WEBridge 서비스 전체 현황 및 최근 활동 요약입니다.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="gap-1.5"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
          새로고침
        </Button>
      </div>

      {/* KPI 카드 그리드 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white border-gray-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">전체 회원</span>
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-gray-900">
              {Number(data.total_users ?? 0).toLocaleString()}명
            </div>
            <div className="mt-1.5 flex items-center gap-2 text-xs text-gray-500">
              <span className="inline-flex items-center gap-0.5 text-green-600 font-medium">
                <UserPlus className="w-3.5 h-3.5" />
                오늘 +{data.today_new_users ?? 0}
              </span>
              <span>· 활성 {data.active_users ?? 0}명</span>
              <span>· 관리자 {data.admin_users ?? 0}명</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">전체 검사</span>
              <ScanSearch className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-gray-900">
              {Number(data.total_scans ?? 0).toLocaleString()}건
            </div>
            <div className="mt-1.5 text-xs text-gray-500">
              오늘 <span className="font-semibold text-indigo-600">+{data.today_scans ?? 0}건</span>{" "}
              요청됨
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">검사 처리 현황</span>
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-gray-900">
              {Number(data.completed_scans ?? 0).toLocaleString()}건 완료
            </div>
            <div className="mt-1.5 text-xs text-gray-500">
              실패{" "}
              <span className="font-semibold text-red-600">
                {Number(data.failed_scans ?? 0).toLocaleString()}건
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">
                웹 접근성 평균 점수
              </span>
              <Award className="w-5 h-5 text-amber-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-gray-900">
              {typeof data.average_compliance_score === "number"
                ? `${data.average_compliance_score.toFixed(1)}점`
                : "-"}
            </div>
            <div className="mt-1.5 text-xs text-gray-500">
              완료된 검사 기준 평균 적합도
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 최근 7일 추이 차트 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DailyBarChart
          title="최근 7일 신규 회원 추이"
          data={data.daily_new_users || []}
          barColorClass="bg-blue-500"
        />
        <DailyBarChart
          title="최근 7일 일자별 검사 건수 추이"
          data={data.daily_scans || []}
          barColorClass="bg-indigo-500"
        />
      </div>

      {/* 최근 목록 2개 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 최근 검사 5건 */}
        <Card className="bg-white border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold text-gray-900">
              최근 검사 5건
            </CardTitle>
            <Link
              to="/admin/scans"
              className="text-xs font-medium text-blue-600 hover:underline"
            >
              전체 보기
            </Link>
          </CardHeader>
          <CardContent>
            {!data.recent_scans?.length ? (
              <p className="py-6 text-sm text-center text-gray-400">
                최근 검사 내역이 없습니다.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="text-xs text-gray-500 border-b border-gray-200">
                      <th className="py-2 pr-3 font-medium">사이트 / URL</th>
                      <th className="py-2 px-2 font-medium text-right">점수</th>
                      <th className="py-2 px-2 font-medium text-center">상태</th>
                      <th className="py-2 pl-2 font-medium">요청자</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.recent_scans.map((scan) => (
                      <tr key={scan.id} className="hover:bg-gray-50">
                        <td className="py-2.5 pr-3 max-w-[180px]">
                          <div className="font-medium text-gray-900 truncate">
                            {scan.title || "(제목 없음)"}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {scan.url}
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-right font-medium text-gray-900">
                          {typeof scan.compliance_score === "number"
                            ? `${Math.round(scan.compliance_score)}점`
                            : "-"}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <StatusBadge status={scan.status} />
                        </td>
                        <td className="py-2.5 pl-2 text-xs text-gray-600 truncate max-w-[140px]">
                          {scan.user_email || scan.requester_email || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 최근 가입 회원 5건 */}
        <Card className="bg-white border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold text-gray-900">
              최근 가입 회원 5건
            </CardTitle>
            <Link
              to="/admin/users"
              className="text-xs font-medium text-blue-600 hover:underline"
            >
              전체 보기
            </Link>
          </CardHeader>
          <CardContent>
            {!data.recent_users?.length ? (
              <p className="py-6 text-sm text-center text-gray-400">
                최근 가입 회원이 없습니다.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="text-xs text-gray-500 border-b border-gray-200">
                      <th className="py-2 pr-3 font-medium">이름 / 이메일</th>
                      <th className="py-2 px-2 font-medium text-center">가입방식</th>
                      <th className="py-2 pl-2 font-medium text-right">가입일</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.recent_users.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="py-2.5 pr-3">
                          <div className="font-medium text-gray-900">
                            {u.name || "(이름 없음)"}
                          </div>
                          <div className="text-xs text-gray-500">{u.email}</div>
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <Badge variant="outline" className="text-xs">
                            {u.provider || "email"}
                          </Badge>
                        </td>
                        <td className="py-2.5 pl-2 text-xs text-right text-gray-500">
                          {u.created_at
                            ? new Date(u.created_at).toLocaleDateString("ko-KR")
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
