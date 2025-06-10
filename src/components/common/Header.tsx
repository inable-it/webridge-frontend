// components/common/Header.tsx
import { useNavigate } from "react-router-dom";

const isLoggedIn = false; // 실제 로그인 상태 연동 필요

export const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between px-6 bg-white border-b h-14">
      {/* 좌측: 로고 + 메뉴 */}
      <div className="flex items-center gap-8">
        {/* 로고 */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img src="/logo.svg" alt="logo" className="w-6 h-6" />
          <span className="text-lg font-semibold">WEBridge</span>
        </div>

        {/* 로고 오른쪽 메뉴 */}
        <nav className="flex gap-6 text-sm font-medium text-gray-700">
          <a
            href="https://poised-split-457.notion.site/InAble-1a863c8cc2e680c9928edc93504e9bd9"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600"
          >
            팀 소개
          </a>

          <a
            href="https://poised-split-457.notion.site/1a863c8cc2e680018aa5edf3f84e197e"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600"
          >
            웹 접근성이란?
          </a>
        </nav>
      </div>

      {/* 우측: 로그인 / 회원가입 */}
      <div className="flex gap-4 text-sm font-medium text-gray-600">
        {isLoggedIn ? (
          <button className="hover:text-blue-600">마이페이지</button>
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
