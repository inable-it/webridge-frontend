import { Header } from "@/components/common/Header";
import { Outlet } from "react-router-dom";

export const SimpleLayout = () => (
  <div className="flex flex-col min-h-screen">
    <Header />
    <main className="flex-1bg-gray-50">
      <Outlet />
    </main>
  </div>
);
