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
    return `hover:text-blue-600 transition-colors ${
      isActive(path) ? "text-blue-600 font-semibold" : ""
    }`;
  };

  return (
    <header className="relative flex items-center justify-between px-6 bg-white border-b h-14">
      {/* 좌측: 로고 + 메뉴 */}
      <div className="flex items-center gap-8">
        <div
          className="flex items-center gap-2 transition-opacity cursor-pointer hover:opacity-80"
          onClick={handleLogoClick}
        >
          <img src="/logo.svg" alt="logo" className="w-6 h-6" />
          <span className="text-lg font-semibold">WEBridge</span>
        </div>

        <nav className="flex gap-6 text-sm font-medium text-gray-700">
          <button
            onClick={() => navigate("/team")}
            className={getMenuItemClass("/team")}
          >
            팀 소개
          </button>
          <button
            onClick={() => navigate("/accessibility")}
            className={getMenuItemClass("/accessibility")}
          >
            웹 접근성이란?
          </button>
        </nav>
      </div>

      {/* 우측: 로그인 / 마이페이지 */}
      <div className="relative flex gap-4 text-sm font-medium text-gray-600">
        {user ? (
          <div className="relative w-40 text-center">
            <span
              className="inline-block w-full text-blue-600 transition-colors cursor-pointer hover:text-blue-700"
              onClick={() => setDropdownOpen((prev) => !prev)}
            >
              {user.name}
            </span>
            {dropdownOpen && (
              <>
                {/* 드롭다운 외부 클릭 시 닫기용 오버레이 */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 z-20 w-40 mt-2 text-center bg-white border rounded shadow-md">
                  <button
                    onClick={handleLogout}
                    className="block w-full px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
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
              className="transition-colors hover:text-blue-600"
            >
              로그인
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="transition-colors hover:text-blue-600"
            >
              회원가입
            </button>
          </>
        )}
      </div>
    </header>
  );
};
