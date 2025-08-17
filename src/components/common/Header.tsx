import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useState } from "react";
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

  // 모든 토큰과 저장된 데이터 정리하는 함수
  const clearAllData = async () => {
    // 토큰들 삭제 (다양한 키 형태 대비)
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

    // 페이지 새로고침
    window.location.reload();
  };

  const handleLogout = async () => {
    const refreshToken =
      localStorage.getItem("refreshToken") ||
      localStorage.getItem("refresh_token");

    if (!refreshToken) {
      // 서버에 요청은 생략하고 로컬 초기화만 진행
      await clearAllData();
      return;
    }

    try {
      await logout({ refresh: refreshToken }).unwrap();
      await clearAllData();
    } catch (error) {
      console.error("로그아웃 실패", error);

      // 서버 로그아웃이 실패해도 로컬 데이터는 정리
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
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/");
    }
  };

  // 현재 경로와 비교하여 메뉴 항목에 활성화 스타일 부여
  const isActive = (path: string) => location.pathname === path;

  // 메뉴 항목 스타일링
  const getMenuItemClass = (path: string) => {
    return `px-1.5 py-2.5 flex flex-col justify-center items-center gap-2.5 text-[#344054] text-base font-semibold font-['Pretendard_Variable'] leading-6 hover:text-blue-600 transition-colors ${
      isActive(path) ? "text-blue-600" : ""
    }`;
  };

  return (
    <header className="w-full px-6 py-4 bg-white border-b border-[#D9D9D9] flex justify-between items-center">
      {/* 좌측: 로고 + 메뉴 */}
      <div className="flex items-center justify-start gap-8">
        {/* 로고 섹션 */}
        <div
          className="flex justify-center items-center gap-3.5 cursor-pointer transition-opacity hover:opacity-80"
          onClick={handleLogoClick}
        >
          {/* 로고 아이콘 */}
          <img src="/logo.svg" alt="logo" className="w-11 h-11" />

          {/* 로고 텍스트 */}
          <div className="text-center text-[#101828] text-2xl font-bold font-['Pretendard_Variable'] leading-8">
            WEBridge
          </div>
        </div>

        {/* 네비게이션 메뉴 */}
        <nav className="flex items-center justify-start gap-8">
          <button
            onClick={() => navigate("/team")}
            className={getMenuItemClass("/team")}
          >
            <div className="flex flex-col justify-center text-center">
              팀 소개
            </div>
          </button>
          <button
            onClick={() => navigate("/accessibility")}
            className={getMenuItemClass("/accessibility")}
          >
            <div className="flex flex-col justify-center">웹 접근성이란?</div>
          </button>
        </nav>
      </div>

      {/* 우측: 로그인 / 사용자 메뉴 */}
      <div className="flex items-center justify-end gap-8">
        {user ? (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="px-1.5 py-2.5 flex flex-col justify-center items-center gap-2.5 text-[#344054] text-base font-semibold font-['Pretendard_Variable'] leading-6 hover:text-blue-600 transition-colors"
            >
              <div className="flex flex-col justify-center text-center">
                {user.name}
              </div>
            </button>

            {dropdownOpen && (
              <>
                {/* 드롭다운 외부 클릭 시 닫기용 오버레이 */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 z-20 mt-2 bg-white border border-[#E4E7EC] rounded-lg shadow-lg min-w-[120px]">
                  <button
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
          <>
            <button
              onClick={() => navigate("/login")}
              className="px-1.5 py-2.5 flex flex-col justify-center items-center gap-2.5 text-[#344054] text-base font-semibold font-['Pretendard_Variable'] leading-6 hover:text-blue-600 transition-colors"
            >
              <div className="flex flex-col justify-center text-center">
                로그인
              </div>
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="px-1.5 py-2.5 flex flex-col justify-center items-center gap-2.5 text-[#344054] text-base font-semibold font-['Pretendard_Variable'] leading-6 hover:text-blue-600 transition-colors"
            >
              <div className="flex flex-col justify-center">회원가입</div>
            </button>
          </>
        )}
      </div>
    </header>
  );
};
