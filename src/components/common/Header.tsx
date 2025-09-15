import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect, useRef } from "react";
import type { RootState } from "@/app/store";
import { useLogoutMutation } from "@/features/api/authApi";
import { clearUser } from "@/features/store/userSlice";
import { toast } from "@/hooks/use-toast";
import { publicApi } from "@/app/api";
import { persistor } from "@/app/store";

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user.user);
  const [logout] = useLogoutMutation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // ▶ 로고 버튼 ref (마운트 시 포커스)
  const logoBtnRef = useRef<HTMLButtonElement>(null);

  // 현재 스토리지에 토큰이 있는지 여부
  const hasTokens = Boolean(
    localStorage.getItem("accessToken") ||
      localStorage.getItem("refreshToken") ||
      localStorage.getItem("access_token") ||
      localStorage.getItem("refresh_token")
  );

  // 모든 토큰과 저장된 데이터 정리하는 함수
  const clearAllData = async () => {
    // 토큰 삭제 (다양한 키 형태 대비)
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("access_token");

    // Redux persist 데이터 삭제
    localStorage.removeItem("persist:root");
    await persistor.purge();

    // Redux 상태 초기화
    dispatch(clearUser());
    dispatch(publicApi.util.resetApiState());

    // 드롭다운 닫기 및 안전 이동
    setDropdownOpen(false);
    if (location.pathname !== "/") navigate("/");
  };

  // 마운트 시: 토큰이 없으면 즉시 로그아웃 처리 (우측 상단을 로그아웃 상태로 만듦)
  useEffect(() => {
    if (!hasTokens && user) {
      clearAllData();
    }
    // 로고에 프로그램적 포커스 이동
    logoBtnRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    const refreshToken =
      localStorage.getItem("refreshToken") ||
      localStorage.getItem("refresh_token");

    if (!refreshToken) {
      await clearAllData();
      toast({
        title: "로그아웃 완료",
        description: "성공적으로 로그아웃되었습니다.",
      });
      return;
    }

    try {
      await logout({ refresh: refreshToken }).unwrap();
      await clearAllData();
      toast({
        title: "로그아웃 완료",
        description: "성공적으로 로그아웃되었습니다.",
      });
    } catch (error) {
      console.error("로그아웃 실패", error);
      await clearAllData();
      toast({
        variant: "destructive",
        title: "로그아웃 실패",
        description: "로컬 데이터는 정리되었습니다.",
      });
    }
  };

  // 로고 클릭 핸들러
  const handleLogoClick = () => {
    if (user && hasTokens) {
      navigate("/dashboard");
    } else {
      navigate("/");
    }
  };

  // 현재 경로와 비교하여 메뉴 항목에 활성화 스타일 부여
  const isActive = (path: string) => location.pathname === path;

  // 메뉴 항목 스타일링 (포커스 가시성 강화)
  const getMenuItemClass = (path: string) => {
    const base =
      "px-1.5 py-2.5 flex flex-col justify-center items-center gap-2.5 text-[#344054] text-base font-semibold font-['Pretendard_Variable'] leading-6 hover:text-blue-600 transition-colors rounded-md outline-none focus:outline-none focus-visible:ring-4 focus-visible:ring-offset-2";
    const ringColor =
      path === "/accessibility"
        ? "focus-visible:ring-amber-500"
        : "focus-visible:ring-blue-700";
    const active = isActive(path) ? "text-blue-600" : "";
    return `${base} ${ringColor} ${active}`;
  };

  return (
    <header className="w-full px-6 py-4 bg-white border-b border-[#727272] flex justify-between items-center">
      {/* 좌측: 로고 + 메뉴 */}
      <div className="flex items-center justify-start gap-8">
        {/* ▶ 로고: 접근 가능한 버튼 + 포커스 링 + 프로그램적 포커스 */}
        <button
          type="button"
          ref={logoBtnRef}
          onClick={handleLogoClick}
          aria-label="WEBridge 홈으로 이동"
          className="flex justify-center items-center gap-3.5 cursor-pointer transition-colors hover:bg-gray-100 rounded-lg outline-none focus:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:ring-blue-600"
        >
          <img
            src="/logo.svg"
            alt="WEBridge Logo"
            aria-hidden="true"
            className="w-11 h-11"
          />
          <div className="text-center text-[#101828] text-2xl font-bold font-['Pretendard_Variable'] leading-8">
            WEBridge
          </div>
        </button>

        {/* 네비게이션 메뉴 */}
        <nav className="flex items-center justify-start gap-8">
          <button
            type="button"
            aria-current={isActive("/team") ? "page" : undefined}
            onClick={() => navigate("/team")}
            className={getMenuItemClass("/team")}
          >
            <div className="flex flex-col justify-center text-center">
              팀 소개
            </div>
          </button>

          {/* ▶ ‘웹 접근성이란?’ : 앰버색 포커스 링으로 차별화 */}
          <button
            type="button"
            aria-current={isActive("/accessibility") ? "page" : undefined}
            onClick={() => navigate("/accessibility")}
            className={getMenuItemClass("/accessibility")}
          >
            <div className="flex flex-col justify-center">웹 접근성이란?</div>
          </button>
        </nav>
      </div>

      {/* 우측: 로그인 / 사용자 메뉴 */}
      <div className="flex items-center justify-end gap-8">
        {user && hasTokens ? (
          // 정상 로그인 상태: 사용자 드롭다운
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="px-1.5 py-2.5 flex flex-col justify-center items-center gap-2.5 text-[#344054] text-base font-semibold font-['Pretendard_Variable'] leading-6 hover:text-blue-600 transition-colors rounded-md outline-none focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:ring-blue-700"
            >
              <div className="flex flex-col justify-center text-center">
                {user.name}
              </div>
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 z-20 mt-2 bg-white border border-[#E4E7EC] rounded-lg shadow-lg min-w-[120px]">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="block w-full px-4 py-3 text-sm text-[#344054] hover:bg-gray-50 transition-colors text-left"
                  >
                    로그아웃
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          // 비로그인 상태: 로그인/회원가입 버튼
          <>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="px-1.5 py-2.5 flex flex-col justify-center items-center gap-2.5 text-[#344054] text-base font-semibold font-['Pretendard_Variable'] leading-6 hover:text-blue-600 transition-colors rounded-md outline-none focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:ring-blue-700"
            >
              <div className="flex flex-col justify-center text-center">
                로그인
              </div>
            </button>
            <button
              type="button"
              onClick={() => navigate("/signup")}
              className="px-1.5 py-2.5 flex flex-col justify-center items-center gap-2.5 text-[#344054] text-base font-semibold font-['Pretendard_Variable'] leading-6 hover:text-blue-600 transition-colors rounded-md outline-none focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:ring-blue-700"
            >
              <div className="flex flex-col justify-center">회원가입</div>
            </button>
          </>
        )}
      </div>
    </header>
  );
};
