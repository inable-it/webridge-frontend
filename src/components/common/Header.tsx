import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useState } from "react";
import type { RootState } from "@/app/store";
import { useLogoutMutation } from "@/features/api/authApi";
import { clearUser } from "@/features/store/userSlice";
import { toast } from "@/hooks/use-toast";

export const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user.user);
  const [logout] = useLogoutMutation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        throw new Error("No refresh token found.");
      }

      await logout({ refresh: refreshToken }).unwrap();

      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      dispatch(clearUser());

      toast({
        title: "로그아웃 성공",
        description: "다시 로그인 해주세요.",
      });

      navigate("/login");
    } catch (error) {
      console.error("로그아웃 실패", error);
      toast({
        variant: "destructive",
        title: "로그아웃 실패",
        description: "다시 시도해 주세요.",
      });
    }
  };

  return (
    <header className="relative flex items-center justify-between px-6 bg-white border-b h-14">
      {/* 좌측: 로고 + 메뉴 */}
      <div className="flex items-center gap-8">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => {
            if (user) {
              navigate("/dashboard");
            } else {
              navigate("/");
            }
          }}
        >
          <img src="/logo.svg" alt="logo" className="w-6 h-6" />
          <span className="text-lg font-semibold">WEBridge</span>
        </div>

        <nav className="flex gap-6 text-sm font-medium text-gray-700">
          <button
            onClick={() => navigate("/team")}
            className="hover:text-blue-600"
          >
            팀 소개
          </button>
          <button
            onClick={() => navigate("/accessibility")}
            className="hover:text-blue-600"
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
              className="inline-block w-full text-blue-600 cursor-pointer"
              onClick={() => setDropdownOpen((prev) => !prev)}
            >
              {user.name}
            </span>
            {dropdownOpen && (
              <div className="absolute right-0 w-40 mt-2 text-center bg-white border rounded shadow-md">
                <button
                  onClick={handleLogout}
                  className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  로그아웃
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <button
              onClick={() => navigate("/login")}
              className="hover:text-blue-600"
            >
              로그인
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="hover:text-blue-600"
            >
              회원가입
            </button>
          </>
        )}
      </div>
    </header>
  );
};
