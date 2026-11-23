import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  LayoutDashboard,
  Users,
  ScanSearch,
  FileText,
  BarChart3,
  MessageSquareHeart,
  MessageSquare,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminApi } from "@/app/api";
import { toast } from "@/hooks/use-toast";

const NAV_ITEMS = [
  { to: "/admin", label: "대시보드", icon: LayoutDashboard, end: true },
  { to: "/admin/users", label: "회원 관리", icon: Users, end: false },
  { to: "/admin/scans", label: "검사 내역 관리", icon: ScanSearch, end: false },
  { to: "/admin/terms", label: "약관 관리", icon: FileText, end: false },
  { to: "/admin/surveys", label: "가입 설문 통계", icon: BarChart3, end: false },
  {
    to: "/admin/alt-text-feedback",
    label: "AI 대체텍스트 피드백",
    icon: MessageSquareHeart,
    end: false,
  },
  {
    to: "/admin/feedback",
    label: "서비스 이용 피드백",
    icon: MessageSquare,
    end: false,
  },
];

export const AdminLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const adminUser = (() => {
    try {
      const raw = localStorage.getItem("admin_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const handleLogout = () => {
    localStorage.removeItem("admin_access_token");
    localStorage.removeItem("admin_user");
    dispatch(adminApi.util.resetApiState());
    toast({
      title: "로그아웃",
      description: "관리자 계정에서 로그아웃되었습니다.",
    });
    navigate("/admin/login", { replace: true });
  };

  const renderNavLinks = (onNavigate?: () => void) => (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              }`
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-[#F5F7FB]">
      {/* 데스크톱 사이드바 */}
      <aside className="hidden w-64 bg-white border-r border-gray-200 md:flex md:flex-col shrink-0">
        <div className="flex items-center gap-2.5 h-16 px-5 border-b border-gray-200">
          <div className="flex items-center justify-center w-8 h-8 text-white bg-blue-600 rounded-lg">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-bold text-gray-900 leading-tight">
              WEBridge
            </div>
            <div className="text-[11px] font-medium text-blue-600">
              Admin Console
            </div>
          </div>
        </div>

        {renderNavLinks()}

        <div className="p-4 border-t border-gray-200">
          <a
            href="/dashboard"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-3 py-2 text-xs font-medium text-gray-600 transition-colors rounded-lg hover:bg-gray-100 hover:text-gray-900"
          >
            <span>사용자 서비스 열기</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </aside>

      {/* 모바일 사이드바 드로어 */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative z-10 flex flex-col w-64 h-full bg-white shadow-xl">
            <div className="flex items-center justify-between h-16 px-5 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-gray-900">WEBridge Admin</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 text-gray-500 rounded hover:bg-gray-100"
                aria-label="메뉴 닫기"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {renderNavLinks(() => setMobileMenuOpen(false))}
          </aside>
        </div>
      )}

      {/* 우측 메인 영역 */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* 헤더 */}
        <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-gray-600 rounded-lg md:hidden hover:bg-gray-100"
              aria-label="메뉴 열기"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-semibold text-gray-800 sm:text-base">
              WEBridge 관리자 콘솔
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {adminUser && (
              <div className="hidden text-right sm:block">
                <div className="text-sm font-medium text-gray-900">
                  {adminUser.name || "관리자"}
                </div>
                <div className="text-xs text-gray-500">{adminUser.email}</div>
              </div>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-1.5 text-gray-700 border-gray-300 hover:bg-gray-100"
            >
              <LogOut className="w-4 h-4" />
              <span>로그아웃</span>
            </Button>
          </div>
        </header>

        {/* 페이지 컨텐츠 */}
        <main id="main-content" tabIndex={-1} className="flex-1 p-4 sm:p-6 lg:p-8 outline-none">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
