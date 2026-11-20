import {
  BarChart3,
  Users,
  UserCheck,
  TrendingUp,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  useGetAdminSignupSurveysQuery,
  type SurveyStatItem,
} from "@/features/api/adminApi";

const BAR_COLORS = [
  "bg-blue-600",
  "bg-indigo-500",
  "bg-sky-500",
  "bg-teal-500",
  "bg-emerald-500",
  "bg-amber-500",
];

const StatBarSection = ({
  title,
  items,
  recentOtherAnswers,
}: {
  title: string;
  items: SurveyStatItem[];
  recentOtherAnswers?: string[];
}) => {
  return (
    <Card className="bg-white border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900">
          <BarChart3 className="w-4 h-4 text-blue-600" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="py-10 text-sm text-center text-gray-400">
            수집된 통계 데이터가 없습니다.
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item, idx) => {
              const pct = Math.min(100, Math.max(0, Number(item.percentage || 0)));
              const barColor = BAR_COLORS[idx % BAR_COLORS.length];
              return (
                <div key={item.code || idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {item.label || item.code}
                      </span>
                      <span className="text-xs text-gray-400">
                        ({item.code})
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-gray-700">
                      {Number(item?.count ?? 0).toLocaleString()}명 ({pct.toFixed(1)}%)
                    </div>
                  </div>
                  <div className="w-full h-3 overflow-hidden bg-gray-100 rounded-full">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {recentOtherAnswers && recentOtherAnswers.length > 0 && (
              <div className="pt-4 mt-6 border-t border-gray-100">
                <div className="mb-2 text-xs font-semibold text-gray-500">
                  최근 '기타' 응답 내용
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {recentOtherAnswers.map((ans, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-md"
                    >
                      {ans}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const AdminSurveysPage = () => {
  const { data, isLoading, isError, refetch, isFetching } =
    useGetAdminSignupSurveysQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-500">
        <Loader2 className="w-6 h-6 mr-2 animate-spin" />
        가입 설문 통계를 불러오는 중...
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="w-10 h-10 mb-3 text-red-500" />
        <p className="mb-4 text-sm text-gray-600">
          가입 설문 통계 데이터를 불러오지 못했습니다.
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          다시 시도
        </Button>
      </div>
    );
  }

  const payload = ((data as any)?.data ?? data) as typeof data;
  const totalResponses = Number(
    payload?.total_responded_users ?? payload?.total_responses ?? 0
  );
  const totalUsers =
    payload?.total_users != null ? Number(payload.total_users) : undefined;
  const responseRate =
    payload?.response_rate != null ? Number(payload.response_rate) : undefined;

  const pathStats = Array.isArray(payload?.path_stats)
    ? payload.path_stats
    : Array.isArray(payload?.path_to_webridge_stats)
    ? payload.path_to_webridge_stats
    : [];
  const occupationStats = Array.isArray(payload?.occupation_stats)
    ? payload.occupation_stats
    : [];

  const recentPathOtherAnswers = Array.isArray(payload?.recent_path_other_answers)
    ? payload.recent_path_other_answers.filter(
        (ans) => typeof ans === "string" && ans.trim().length > 0
      )
    : [];
  const recentOccupationOtherAnswers = Array.isArray(
    payload?.recent_occupation_other_answers
  )
    ? payload.recent_occupation_other_answers.filter(
        (ans) => typeof ans === "string" && ans.trim().length > 0
      )
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">가입 설문 통계</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            회원 가입 시 수집된 유입 경로 및 직군별 분포 통계입니다.
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

      {/* 요약 통계 카드 그리드 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="bg-white border-gray-200">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <div className="text-sm font-medium text-gray-500">
                총 가입 설문 응답자 수
              </div>
              <div className="mt-1 text-3xl font-bold text-gray-900">
                {totalResponses.toLocaleString()}명
              </div>
            </div>
            <div className="flex items-center justify-center w-12 h-12 text-blue-600 rounded-xl bg-blue-50">
              <Users className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <div className="text-sm font-medium text-gray-500">
                전체 회원 수
              </div>
              <div className="mt-1 text-3xl font-bold text-gray-900">
                {totalUsers != null ? `${totalUsers.toLocaleString()}명` : "-"}
              </div>
            </div>
            <div className="flex items-center justify-center w-12 h-12 text-indigo-600 rounded-xl bg-indigo-50">
              <UserCheck className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <div className="text-sm font-medium text-gray-500">
                설문 응답률
              </div>
              <div className="mt-1 text-3xl font-bold text-gray-900">
                {responseRate != null ? `${responseRate.toFixed(1)}%` : "-"}
              </div>
            </div>
            <div className="flex items-center justify-center w-12 h-12 text-emerald-600 rounded-xl bg-emerald-50">
              <TrendingUp className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 유입 경로 / 직군 통계 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <StatBarSection
          title="유입 경로별 통계"
          items={pathStats}
          recentOtherAnswers={recentPathOtherAnswers}
        />
        <StatBarSection
          title="직군별 통계"
          items={occupationStats}
          recentOtherAnswers={recentOccupationOtherAnswers}
        />
      </div>
    </div>
  );
};

export default AdminSurveysPage;
