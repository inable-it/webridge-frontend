import { useState, useEffect } from "react";

/**
 * 맨위로 바로 가기 플로팅 버튼
 * 스크롤이 발생했을 때 우측 하단에 원형 플로팅 버튼으로 표시되며,
 * 클릭 시 페이지 최상단으로 부드럽게 스크롤됩니다.
 */
export const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      const mainElem = document.getElementById("main-content");
      const mainScroll = mainElem ? mainElem.scrollTop : 0;
      const windowScroll = window.scrollY || document.documentElement.scrollTop;

      if (mainScroll > 150 || windowScroll > 150) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility, { passive: true });
    const mainElem = document.getElementById("main-content");
    if (mainElem) {
      mainElem.addEventListener("scroll", toggleVisibility, { passive: true });
    }

    // 초기 스크롤 위치 확인
    toggleVisibility();

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
      if (mainElem) {
        mainElem.removeEventListener("scroll", toggleVisibility);
      }
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const mainElem = document.getElementById("main-content");
    if (mainElem) {
      mainElem.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="맨 위로 바로가기"
      title="맨 위로 바로가기"
      className={`group fixed bottom-8 right-8 z-50 flex items-center justify-center w-12 h-12 bg-white text-gray-700 rounded-full border border-gray-200 shadow-md hover:shadow-lg hover:bg-gray-50 hover:text-[#155DFC] hover:border-[#155DFC] transition-all duration-200 outline-none focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:ring-[#155DFC] ${
        isVisible
          ? "opacity-100 scale-100 pointer-events-auto"
          : "opacity-0 scale-90 pointer-events-none"
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5 transition-transform duration-200 group-hover:-translate-y-0.5"
        aria-hidden="true"
      >
        <path d="M5 4h14" />
        <path d="m18 14-6-6-6 6" />
        <path d="M12 8v12" />
      </svg>
    </button>
  );
};
