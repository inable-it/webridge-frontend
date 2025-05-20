import { LNB } from "@/components/common/LeftNavigationBar";
import { Header } from "@/components/common/Header";
import type { ReactNode } from "react";

interface BaseLayoutProps {
  children: ReactNode;
}

export const BaseLayout = ({ children }: BaseLayoutProps) => {
  return (
    <div className="grid grid-rows-[auto_1fr] grid-cols-[auto_1fr] h-screen">
      {/* Header: 좌우 전체 영역 차지 */}
      <div className="col-span-2">
        <Header />
      </div>

      {/* LNB: 좌측 영역만 표시 (md 이상에서만) */}
      <aside className="hidden w-64 h-full bg-white border-r md:block">
        <LNB />
      </aside>

      {/* Main Content */}
      <main className="p-6 overflow-auto bg-gray-50">{children}</main>
    </div>
  );
};
