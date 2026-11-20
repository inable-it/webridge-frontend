import React from "react";

/**
 * 6.4.1 (반복 영역 건너뛰기)
 * 페이지의 맨 앞 요소로 '본문 바로가기' 링크를 제공하며,
 * 키보드 Tab 키로 초점을 받으면 화면 상단에 검은색 바로 표시됩니다.
 */
export const SkipToContent = () => {
  const handleSkip = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById("main-content");
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <a
      href="#main-content"
      onClick={handleSkip}
      className="fixed top-0 left-0 right-0 z-[9999] -translate-y-full focus:translate-y-0 transition-transform duration-200 flex items-center justify-center w-full py-3 bg-[#0F172A] text-white text-sm font-bold shadow-lg outline-none focus:ring-4 focus:ring-blue-500"
    >
      본문 바로가기
    </a>
  );
};
