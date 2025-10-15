import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { GlobalLoadingOverlay } from "@/components/common/GlobalLoadingOverlay";
import { RouteLoadingBinder } from "@/components/common/RouteLoadingBinder"; // useNavigation 쓰는 컴포넌트

export default function RootShell() {
  return (
    <>
      <Outlet />
      <Toaster />
      {/* 페이지 전환 로딩 바인더 (Data Router 전용) */}
      <RouteLoadingBinder />
      {/* 전역 로딩 오버레이 */}
      <GlobalLoadingOverlay />
    </>
  );
}
