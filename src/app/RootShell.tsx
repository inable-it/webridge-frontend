import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { GlobalLoadingOverlay } from "@/components/common/GlobalLoadingOverlay";
import { RouteLoadingBinder } from "@/components/common/RouteLoadingBinder"; // useNavigation 쓰는 컴포넌트
import { SkipToContent } from "@/components/common/SkipToContent";
import { ScrollToTopButton } from "@/components/common/ScrollToTopButton";

export default function RootShell() {
  return (
    <>
      {/* 6.4.1 (반복 영역 건너뛰기) 본문 바로가기 */}
      <SkipToContent />
      <Outlet />
      {/* 맨위로 바로 가기 플로팅 버튼 */}
      <ScrollToTopButton />
      <Toaster />
      {/* 페이지 전환 로딩 바인더 (Data Router 전용) */}
      <RouteLoadingBinder />
      {/* 전역 로딩 오버레이 */}
      <GlobalLoadingOverlay />
    </>
  );
}
