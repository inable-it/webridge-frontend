import { Header } from "@/components/common/Header";
import { LNB } from "@/components/common/LeftNavigationBar";
import { Outlet } from "react-router-dom";

export const BaseLayout = () => (
  <div className="grid grid-rows-[auto_1fr] grid-cols-[auto_1fr] h-screen">
    <div className="col-span-2">
      <Header />
    </div>
    <aside className="hidden w-64 h-full bg-white border-r md:block">
      <LNB />
    </aside>
    <main className="overflow-auto bg-gray-50">
      <Outlet />
    </main>
  </div>
);
